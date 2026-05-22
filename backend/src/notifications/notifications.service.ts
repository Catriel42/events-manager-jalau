import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import {
  Event,
  NotificationStatus,
  NotificationType,
  User,
} from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private mailer: MailerService,
    private prisma: PrismaService,
  ) {}

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
      await this.mailer.sendMail({
        to: user.email,
        subject: isWaitlisted
          ? `You're on the waitlist for "${event.title}"`
          : `You're registered for "${event.title}"! 🎉`,
        template: 'registration-confirmation',
        context: {
          name: user.full_name,
          eventTitle: event.title,
          eventDate: this.formatDate(event.starts_at),
          eventTime: this.formatTime(event.starts_at),
          location:
            event.event_type === 'virtual' ? event.meeting_url : event.location,
          isVirtual: event.event_type === 'virtual',
          isWaitlisted,
          waitlistPosition,
        },
      });

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

    await this.prisma.notificationLog.create({
      data: {
        registration_id: registrationId,
        type,
        status,
        sent_at: status === NotificationStatus.sent ? new Date() : null,
        error_message: errorMessage ?? null,
      },
    });
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
      await this.mailer.sendMail({
        to: user.email,
        subject: isOneHour
          ? `⏰ "${event.title}" starts in 1 hour!`
          : `📅 Reminder: "${event.title}" is tomorrow!`,
        template: 'event-reminder',
        context: {
          name: user.full_name,
          eventTitle: event.title,
          eventDate: this.formatDate(event.starts_at),
          eventTime: this.formatTime(event.starts_at),
          location:
            event.event_type === 'virtual' ? event.meeting_url : event.location,
          isVirtual: event.event_type === 'virtual',
          isOneHour,
        },
      });

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
