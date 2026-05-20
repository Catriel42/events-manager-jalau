import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { AdminGuard } from './guards/admin.guard';
import { CalendarService, CalendarSyncResult } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly calendarService: CalendarService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':id/sync-calendar')
  @UseGuards(JwtAuthGuard)
  async syncCalendar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { id: string } },
  ) {
    const event = await this.eventsService.findById(id);
    const userId = req.user.id;

    // Check if the user is registered
    const registration = await this.prisma.registration.findUnique({
      where: {
        event_id_user_id: { event_id: id, user_id: userId },
      },
    });

    if (!registration) {
      throw new Error(
        'You must be registered to sync this event to your calendar.',
      );
    }

    // Obtenemos el usuario completo con sus tokens
    const fullUser = await this.usersService.findById(userId);

    if (!fullUser) throw new Error('User not found');

    let result: CalendarSyncResult | undefined;
    if (registration.calendar_event_id) {
      // Update existing calendar event to prevent duplicates
      result = await this.calendarService.updateEventInUserCalendar(
        fullUser,
        event,
        registration.calendar_event_id,
      );
    } else {
      // Create new calendar event
      result = await this.calendarService.addEventToUserCalendar(
        fullUser,
        event,
      );

      if (result && result.eventId) {
        // Save the external event ID to our database
        await this.prisma.registration.update({
          where: { id: registration.id },
          data: { calendar_event_id: result.eventId },
        });
      }
    }

    return { url: result?.url };
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('includeAll') includeAll?: string,
  ) {
    return this.eventsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      includeAll === 'true',
    );
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.delete(id);
  }
}
