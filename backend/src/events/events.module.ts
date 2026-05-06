import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CalendarService } from './calendar.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [EventsController],
  providers: [EventsService, CalendarService],
  exports: [EventsService, CalendarService],
})
export class EventsModule {}
