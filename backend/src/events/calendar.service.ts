import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { UserEntity } from '@users/dto/user.interface';
import { Event } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private configService: ConfigService) {}

  async addEventToUserCalendar(user: UserEntity, event: Event) {
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
    } catch (error) {
      this.logger.error(
        `Failed to add event to ${user.provider} calendar for ${user.email}`,
        error.stack,
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
    return response.data.htmlLink; // Devolvemos el link directo
  }

  private async addToMicrosoftCalendar(user: UserEntity, event: Event) {
    const client = Client.init({
      authProvider: async (done) => {
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

    const response = await client.api('/me/events').post(microsoftEvent);
    this.logger.log(`Event created in Microsoft Calendar: ${response.id}`);

    // Microsoft no devuelve un webLink directo tan fácil en el POST,
    // pero podemos mandarlos al calendario general.
    return 'https://outlook.live.com/calendar/0/view/month';
  }
}
