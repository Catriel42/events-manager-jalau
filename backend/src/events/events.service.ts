import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { CalendarService } from './calendar.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  async findAll(page = 1, limit = 10, includeAll = false) {
    const skip = (page - 1) * limit;
    const where = includeAll ? {} : { status: { not: 'draft' as const } };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { starts_at: 'desc' },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    const events = data.map((event) => ({
      ...event,
      tags: event.tags.map((et) => et.tag),
    }));

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const confirmedCount = await this.prisma.registration.count({
      where: { event_id: id, status: 'confirmed' },
    });

    return {
      ...event,
      tags: event.tags.map((et) => et.tag),
      registered_count: confirmedCount,
    };
  }

  async create(data: CreateEventDto) {
    const { tag_ids, ...eventData } = data;

    const calendarUid = crypto.randomUUID();

    const event = await this.prisma.event.create({
      data: {
        ...eventData,
        starts_at: new Date(eventData.starts_at),
        ends_at: new Date(eventData.ends_at),
        calendar_uid: calendarUid,
        ...(tag_ids && {
          tags: {
            create: tag_ids.map((tagId) => ({
              tag_id: tagId,
            })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      ...event,
      tags: event.tags.map((et) => et.tag),
    };
  }

  async update(id: string, data: UpdateEventDto) {
    await this.findById(id);

    const eventData = data;
    const startAt = data.starts_at;
    const endAt = data.ends_at;
    const tagIds = data.tag_ids;

    const updateData: Prisma.EventUpdateInput = {
      ...eventData,
      ...(startAt && { starts_at: new Date(startAt) }),
      ...(endAt && { ends_at: new Date(endAt) }),
    };

    if (tagIds !== undefined) {
      await this.prisma.event_tags.deleteMany({
        where: { event_id: id },
      });

      if (tagIds.length > 0) {
        await this.prisma.event_tags.createMany({
          data: tagIds.map((tagId) => ({
            event_id: id,
            tag_id: tagId,
          })),
        });
      }
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Find all registrations with a synced calendar event
    const syncedRegistrations = await this.prisma.registration.findMany({
      where: {
        event_id: id,
        calendar_event_id: { not: null },
      },
      include: {
        user: true,
      },
    });

    if (syncedRegistrations.length > 0) {
      // Background promise call to prevent blocking request
      Promise.allSettled(
        syncedRegistrations.map((reg) =>
          this.calendarService.updateEventInUserCalendar(
            reg.user,
            event,
            reg.calendar_event_id!,
          ),
        ),
      ).catch((err) => {
        console.error('Failed to sync updated event to user calendars:', err);
      });
    }

    return {
      ...event,
      tags: event.tags.map((et) => et.tag),
    };
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.event.delete({
      where: { id },
    });

    return { success: true };
  }
}
