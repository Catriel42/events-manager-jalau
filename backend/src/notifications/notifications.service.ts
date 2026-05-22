import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import {
  Event,
  NotificationStatus,
  NotificationType,
  User,
} from '@prisma/client';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;
  private templateDir: string;
  private compiledTemplates: Map<string, handlebars.TemplateDelegate> =
    new Map();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('MAIL_PASS');
    if (!apiKey) {
      this.logger.warn('MAIL_PASS is not set. Resend email sending will fail.');
    }
    // We use MAIL_PASS since that was originally used for SMTP auth.
    this.resend = new Resend(apiKey);
  }

  onModuleInit() {
    this.templateDir = path.join(
      __dirname,
      __dirname.endsWith('notifications')
        ? 'templates'
        : 'notifications/templates',
    );
    this.logger.log(`Resolved template directory: ${this.templateDir}`);
  }

  private getCompiledTemplate(
    templateName: string,
  ): handlebars.TemplateDelegate {
    if (this.compiledTemplates.has(templateName)) {
      return this.compiledTemplates.get(templateName)!;
    }

    try {
      const templatePath = path.join(this.templateDir, `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const compiled = handlebars.compile(templateSource, { strict: true });
      this.compiledTemplates.set(templateName, compiled);
      return compiled;
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Sends a registration confirmation email and logs it to NotificationLog.
   * Called immediately when a user registers (or is waitlisted).
   */
  async sendRegistrationConfirmation(
    user: User,
    event: Event,
    registrationId: string,
    waitlistPosition?: number,
  ): Promise<void> {
    const isWaitlisted = !!waitlistPosition;
    const type = isWaitlisted
      ? NotificationType.waitlist_promotion
      : NotificationType.confirmation;

    let status: NotificationStatus = NotificationStatus.sent;
    let errorMessage: string | undefined;

    try {
      const template = this.getCompiledTemplate('registration-confirmation');
      const html = template({
        name: user.full_name,
        eventTitle: event.title,
        eventDate: this.formatDate(event.starts_at),
        eventTime: this.formatTime(event.starts_at),
        location:
          event.event_type === 'virtual' ? event.meeting_url : event.location,
        isVirtual: event.event_type === 'virtual',
        isWaitlisted,
        waitlistPosition,
      });

      const fromEmail =
        this.config.get<string>('MAIL_FROM') || 'Acme <onboarding@resend.dev>';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: isWaitlisted
          ? `You're on the waitlist for "${event.title}"`
          : `You're registered for "${event.title}"! 🎉`,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `Sent ${type} email to ${user.email} for event "${event.title}"`,
      );
    } catch (err: unknown) {
      status = NotificationStatus.failed;
      errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to send ${type} email to ${user.email}: ${errorMessage}`,
      );
    }

    try {
      await this.prisma.notificationLog.create({
        data: {
          registration_id: registrationId,
          type,
          status,
          sent_at: status === NotificationStatus.sent ? new Date() : null,
          error_message: errorMessage ?? null,
        },
      });
    } catch (_dbError) {
      // If the registration was deleted (e.g. user unregistered quickly) while the email
      // was sending, a foreign key violation (P2003) will occur. We can safely ignore this.
      this.logger.warn(
        `Could not save notification log for registration ${registrationId} (it may have been deleted).`,
      );
      console.log(_dbError);
    }
  }

  /**
   * Sends a reminder email and logs it to NotificationLog.
   * Called by the cron job — only for registrations without an existing log of this type.
   */
  async sendEventReminder(
    user: User,
    event: Event,
    registrationId: string,
    type: 'reminder_24h' | 'reminder_1h',
  ): Promise<void> {
    const isOneHour = type === 'reminder_1h';

    let status: NotificationStatus = NotificationStatus.sent;
    let errorMessage: string | undefined;

    try {
      const template = this.getCompiledTemplate('event-reminder');
      const html = template({
        name: user.full_name,
        eventTitle: event.title,
        eventDate: this.formatDate(event.starts_at),
        eventTime: this.formatTime(event.starts_at),
        location:
          event.event_type === 'virtual' ? event.meeting_url : event.location,
        isVirtual: event.event_type === 'virtual',
        isOneHour,
      });

      const fromEmail =
        this.config.get<string>('MAIL_FROM') || 'Acme <onboarding@resend.dev>';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: isOneHour
          ? `⏰ "${event.title}" starts in 1 hour!`
          : `📅 Reminder: "${event.title}" is tomorrow!`,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `Sent ${type} reminder to ${user.email} for event "${event.title}"`,
      );
    } catch (err: unknown) {
      status = NotificationStatus.failed;
      errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to send ${type} reminder to ${user.email}: ${errorMessage}`,
      );
    }

    // Always log — this is what prevents duplicate sends on re-runs
    await this.prisma.notificationLog.create({
      data: {
        registration_id: registrationId,
        type: type,
        status,
        sent_at: status === NotificationStatus.sent ? new Date() : null,
        error_message: errorMessage ?? null,
      },
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
