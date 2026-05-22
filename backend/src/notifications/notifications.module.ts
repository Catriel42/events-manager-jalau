/* eslint-disable @typescript-eslint/no-require-imports */
import { Module } from '@nestjs/common';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';

const { HandlebarsAdapter } =
  require('@nestjs-modules/mailer/adapters/handlebars.adapter') as {
    HandlebarsAdapter: new () => MailerOptions['template'] extends {
      adapter?: infer A;
    }
      ? NonNullable<A>
      : never;
  };
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NotificationsService } from './notifications.service';
import { EventReminderTask } from './event-reminder.task';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const resolvedTemplateDir = join(
          __dirname,
          __dirname.endsWith('notifications')
            ? 'templates'
            : 'notifications/templates',
        );
        console.log('[NotificationsModule] __dirname is:', __dirname);
        console.log(
          '[NotificationsModule] Resolved template dir:',
          resolvedTemplateDir,
        );

        return {
          transport: {
            host: config.get<string>('MAIL_HOST'),
            port: config.get<number>('MAIL_PORT'),
            secure: false, // true for port 465, false for 587
            auth: {
              user: config.get<string>('MAIL_USER'),
              pass: config.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: config.get<string>('MAIL_FROM'),
          },
          template: {
            dir: resolvedTemplateDir,
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [NotificationsService, EventReminderTask],
  exports: [NotificationsService],
})
export class NotificationsModule {}
