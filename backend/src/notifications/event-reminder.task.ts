import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationType, RegistrationStatus } from '@prisma/client';

@Injectable()
export class EventReminderTask {
  private readonly logger = new Logger(EventReminderTask.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Runs every hour at minute 0 (e.g. 09:00, 10:00, 11:00...).
   *
   * For each run it:
   *  1. Finds confirmed registrations for events starting in the next 23-25h
   *     that do NOT yet have a reminder_24h log → sends the 24h reminder.
   *  2. Finds confirmed registrations for events starting in the next 50-70min
   *     that do NOT yet have a reminder_1h log  → sends the 1h reminder.
   *
   * The NotificationLog acts as an idempotency guard: if the cron runs twice
   * or the server restarts, a registration that already got a reminder is
   * skipped because its log entry already exists.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleReminders(): Promise<void> {
    this.logger.log('Running event reminder cron job...');

    const now = new Date();

    // --- 24-hour window ---
    const h24From = new Date(now.getTime() + 23 * 60 * 60 * 1000); // now + 23h
    const h24To   = new Date(now.getTime() + 25 * 60 * 60 * 1000); // now + 25h

    // --- 1-hour window ---
    const h1From = new Date(now.getTime() + 50 * 60 * 1000); // now + 50min
    const h1To   = new Date(now.getTime() + 70 * 60 * 1000); // now + 70min

    await Promise.all([
      this.processWindow(h24From, h24To, 'reminder_24h'),
      this.processWindow(h1From,  h1To,  'reminder_1h'),
    ]);
  }

  /**
   * Queries the database for confirmed registrations in the given time window
   * that have not yet received a notification of the given type, then sends them.
   */
  private async processWindow(
    from: Date,
    to: Date,
    type: 'reminder_24h' | 'reminder_1h',
  ): Promise<void> {
    /*
     * The query:
     *   SELECT r.*
     *   FROM registrations r
     *   JOIN events e ON e.id = r.event_id
     *   WHERE r.status = 'confirmed'
     *     AND e.status = 'published'
     *     AND e.starts_at BETWEEN :from AND :to
     *     AND NOT EXISTS (
     *       SELECT 1 FROM notification_logs n
     *       WHERE n.registration_id = r.id
     *         AND n.type = :type
     *         AND n.status = 'sent'
     *     )
     */
    const registrations = await this.prisma.registration.findMany({
      where: {
        status: RegistrationStatus.confirmed,
        event: {
          status: 'published',
          starts_at: { gte: from, lte: to },
        },
        // Only include registrations that have NOT been sent this reminder type yet
        notification_logs: {
          none: {
            type: type as NotificationType,
            status: 'sent',
          },
        },
      },
      include: {
        event: true,
        user: true,
      },
    });

    this.logger.log(
      `[${type}] Found ${registrations.length} registrations to remind (window: ${from.toISOString()} – ${to.toISOString()})`,
    );

    for (const reg of registrations) {
      try {
        await this.notifications.sendEventReminder(
          reg.user,
          reg.event,
          reg.id,
          type,
        );
      } catch (err: unknown) {
        this.logger.error(
          `Unhandled error reminding ${reg.user.email}: ${String(err)}`,
        );
      }
    }
  }
}
