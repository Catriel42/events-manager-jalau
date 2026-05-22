import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { EventReminderTask } from './event-reminder.task';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [NotificationsService, EventReminderTask],
  exports: [NotificationsService],
})
export class NotificationsModule {}
