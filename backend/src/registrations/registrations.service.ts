import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CalendarService } from '../events/calendar.service';
import { PrismaService } from '../prisma/prisma.service';
import { Registration, RegistrationStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  async register(eventId: string, userId: string): Promise<Registration> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'published') {
      throw new BadRequestException('Cannot register to a non-published event');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.registration.findUnique({
      where: {
        event_id_user_id: { event_id: eventId, user_id: userId },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered to this event');
    }

    let status: RegistrationStatus = RegistrationStatus.confirmed;
    let waitlistPosition: number | null = null;

    if (event.capacity !== null && event.capacity > 0) {
      const confirmedCount = await this.prisma.registration.count({
        where: { event_id: eventId, status: RegistrationStatus.confirmed },
      });

      if (confirmedCount >= event.capacity) {
        status = RegistrationStatus.waitlisted;
        const lastWaitlist = await this.prisma.registration.findFirst({
          where: { event_id: eventId, status: RegistrationStatus.waitlisted },
          orderBy: { waitlist_position: 'desc' },
        });
        waitlistPosition =
          lastWaitlist && lastWaitlist.waitlist_position
            ? lastWaitlist.waitlist_position + 1
            : 1;
      }
    }

    const registration = await this.prisma.registration.create({
      data: {
        event_id: eventId,
        user_id: userId,
        status,
        waitlist_position: waitlistPosition,
      },
    });

    return registration;
  }

  async getRegistration(
    eventId: string,
    userId: string,
  ): Promise<Registration | null> {
    return this.prisma.registration.findUnique({
      where: {
        event_id_user_id: { event_id: eventId, user_id: userId },
      },
    });
  }

  async unregister(eventId: string, userId: string): Promise<void> {
    const registration = await this.prisma.registration.findUnique({
      where: {
        event_id_user_id: { event_id: eventId, user_id: userId },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.calendar_event_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user) {
        await this.calendarService.deleteEventFromUserCalendar(
          user,
          registration.calendar_event_id,
        );
      }
    }

    await this.prisma.registration.delete({
      where: { id: registration.id },
    });

    if (registration.status === RegistrationStatus.confirmed) {
      const nextInLine = await this.prisma.registration.findFirst({
        where: { event_id: eventId, status: RegistrationStatus.waitlisted },
        orderBy: { waitlist_position: 'asc' },
      });

      if (nextInLine) {
        // Promote next user in line
        await this.prisma.registration.update({
          where: { id: nextInLine.id },
          data: {
            status: RegistrationStatus.confirmed,
            waitlist_position: null,
          },
        });

        // Decrement waitlist positions for all other waitlisted users of this event
        await this.prisma.registration.updateMany({
          where: {
            event_id: eventId,
            status: RegistrationStatus.waitlisted,
          },
          data: {
            waitlist_position: {
              decrement: 1,
            },
          },
        });
      }
    } else if (
      registration.status === RegistrationStatus.waitlisted &&
      registration.waitlist_position !== null
    ) {
      // If we cancelled a waitlisted registration, we shift positions of everyone after them
      await this.prisma.registration.updateMany({
        where: {
          event_id: eventId,
          status: RegistrationStatus.waitlisted,
          waitlist_position: {
            gt: registration.waitlist_position,
          },
        },
        data: {
          waitlist_position: {
            decrement: 1,
          },
        },
      });
    }
  }

  async getEventRegistrations(eventId: string) {
    return this.prisma.registration.findMany({
      where: {
        event_id: eventId,
        status: {
          in: [RegistrationStatus.confirmed, RegistrationStatus.waitlisted],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        registered_at: 'desc',
      },
    });
  }
}
