import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { GlobalRegistrationsController } from './global-registrations.controller';
import { RegistrationsService } from './registrations.service';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [EventsModule, NotificationsModule],
  controllers: [RegistrationsController, GlobalRegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}

