import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, Registration, RegistrationStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

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

    const existing = await this.prisma.registration.findUnique({
      where: {
        event_id_user_id: { event_id: eventId, user_id: userId },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered to this event');
    }

    return this.prisma.registration.create({
      data: {
        event_id: eventId,
        user_id: userId,
        status: RegistrationStatus.confirmed,
      },
    });
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

    await this.prisma.registration.delete({
      where: { id: registration.id },
    });
  }

  async getEventRegistration(eventId: string): Promise<Registration[]> {
    return this.prisma.registration.findMany({
      where: { event_id: eventId, status: RegistrationStatus.confirmed },
    });
  }
}
