import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events/:eventId/registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async register(@Param('eventId') eventId: string, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.registrationsService.register(eventId, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyRegistration(
    @Param('eventId') eventId: string,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.registrationsService.getRegistration(eventId, user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async unregister(@Param('eventId') eventId: string, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.registrationsService.unregister(eventId, user.id);
  }
}
