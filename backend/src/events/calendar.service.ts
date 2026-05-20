import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { UserEntity } from '@users/dto/user.interface';
import { Event } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

export interface CalendarSyncResult {
  url: string;
  eventId: string;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private configService: ConfigService) {}

  async addEventToUserCalendar(
    user: UserEntity,
    event: Event,
  ): Promise<CalendarSyncResult | undefined> {
    if (!user.refresh_token) {
      this.logger.warn(
        `User ${user.email} has no refresh token. Skipping calendar sync.`,
      );
      return;
    }

    try {
      if (user.provider === 'google') {
        return await this.addToGoogleCalendar(user, event);
      } else if (user.provider === 'microsoft') {
        return await this.addToMicrosoftCalendar(user, event);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to add event to ${user.provider} calendar for ${user.email}: ${message}`,
        stack,
      );
    }
  }

  private async addToGoogleCalendar(user: UserEntity, event: Event) {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_CALLBACK_URL'),
    );

    oauth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const googleEvent = {
      summary: event.title,
      description: event.description,
      location:
        event.event_type === 'virtual' ? event.meeting_url : event.location,
      start: {
        dateTime: new Date(event.starts_at).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(event.ends_at).toISOString(),
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: googleEvent,
    });

    this.logger.log(
      `Event created in Google Calendar: ${response.data.htmlLink}`,
    );
    return {
      url: response.data.htmlLink!,
      eventId: response.data.id!,
    };
  }

  private async addToMicrosoftCalendar(user: UserEntity, event: Event) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, user.access_token!);
      },
    });

    const microsoftEvent = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description,
      },
      start: {
        dateTime: new Date(event.starts_at).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(event.ends_at).toISOString(),
        timeZone: 'UTC',
      },
      location: {
        displayName:
          event.event_type === 'virtual' ? event.meeting_url : event.location,
      },
    };

    const response = (await client.api('/me/events').post(microsoftEvent)) as {
      id: string;
    };
    this.logger.log(`Event created in Microsoft Calendar: ${response.id}`);

    return {
      url: 'https://outlook.live.com/calendar/0/view/month',
      eventId: response.id,
    };
  }

  async updateEventInUserCalendar(
    user: UserEntity,
    event: Event,
    calendarEventId: string,
  ): Promise<CalendarSyncResult | undefined> {
    if (!user.refresh_token) {
      this.logger.warn(
        `User ${user.email} has no refresh token. Skipping calendar update.`,
      );
      return;
    }

    try {
      if (user.provider === 'google') {
        const oauth2Client = new google.auth.OAuth2(
          this.configService.get('GOOGLE_CLIENT_ID'),
          this.configService.get('GOOGLE_CLIENT_SECRET'),
          this.configService.get('GOOGLE_CALLBACK_URL'),
        );
        oauth2Client.setCredentials({
          access_token: user.access_token,
          refresh_token: user.refresh_token,
        });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const googleEvent = {
          summary: event.title,
          description: event.description,
          location:
            event.event_type === 'virtual' ? event.meeting_url : event.location,
          start: {
            dateTime: new Date(event.starts_at).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(event.ends_at).toISOString(),
            timeZone: 'UTC',
          },
        };

        const response = await calendar.events.update({
          calendarId: 'primary',
          eventId: calendarEventId,
          requestBody: googleEvent,
        });

        this.logger.log(
          `Event ${calendarEventId} updated in Google Calendar for ${user.email}`,
        );
        return {
          url: response.data.htmlLink!,
          eventId: response.data.id!,
        };
      } else if (user.provider === 'microsoft') {
        const client = Client.init({
          authProvider: (done) => {
            done(null, user.access_token!);
          },
        });

        const microsoftEvent = {
          subject: event.title,
          body: {
            contentType: 'HTML',
            content: event.description,
          },
          start: {
            dateTime: new Date(event.starts_at).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(event.ends_at).toISOString(),
            timeZone: 'UTC',
          },
          location: {
            displayName:
              event.event_type === 'virtual'
                ? event.meeting_url
                : event.location,
          },
        };

        await client.api(`/me/events/${calendarEventId}`).patch(microsoftEvent);
        this.logger.log(
          `Event ${calendarEventId} updated in Microsoft Calendar for ${user.email}`,
        );
        return {
          url: 'https://outlook.live.com/calendar/0/view/month',
          eventId: calendarEventId,
        };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to update event ${calendarEventId} in ${user.provider} calendar for ${user.email}: ${message}`,
      );
    }
  }

  async deleteEventFromUserCalendar(user: UserEntity, calendarEventId: string) {
    if (!user.refresh_token) {
      this.logger.warn(
        `User ${user.email} has no refresh token. Skipping calendar deletion.`,
      );
      return;
    }

    try {
      if (user.provider === 'google') {
        const oauth2Client = new google.auth.OAuth2(
          this.configService.get('GOOGLE_CLIENT_ID'),
          this.configService.get('GOOGLE_CLIENT_SECRET'),
          this.configService.get('GOOGLE_CALLBACK_URL'),
        );
        oauth2Client.setCredentials({
          access_token: user.access_token,
          refresh_token: user.refresh_token,
        });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: calendarEventId,
        });
        this.logger.log(
          `Event ${calendarEventId} deleted from Google Calendar for ${user.email}`,
        );
      } else if (user.provider === 'microsoft') {
        const client = Client.init({
          authProvider: (done) => {
            done(null, user.access_token!);
          },
        });
        await client.api(`/me/events/${calendarEventId}`).delete();
        this.logger.log(
          `Event ${calendarEventId} deleted from Microsoft Calendar for ${user.email}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to delete event ${calendarEventId} from ${user.provider} calendar for ${user.email}: ${message}`,
      );
    }
  }
}
