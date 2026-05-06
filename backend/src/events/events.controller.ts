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
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly calendarService: CalendarService,
    private readonly usersService: UsersService,
  ) {}

  @Post(':id/sync-calendar')
  @UseGuards(JwtAuthGuard)
  async syncCalendar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { id: string } },
  ) {
    const event = await this.eventsService.findById(id);
    const userId = req.user.id;

    // Obtenemos el usuario completo con sus tokens
    const fullUser = await this.usersService.findById(userId);

    if (!fullUser) throw new Error('User not found');

    const link = await this.calendarService.addEventToUserCalendar(
      fullUser,
      event,
    );
    return { url: link };
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
