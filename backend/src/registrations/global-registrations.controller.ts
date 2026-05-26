import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { AdminGuard } from '../events/guards/admin.guard';
import { RegistrationStatus } from '@prisma/client';

@Controller('registrations')
@UseGuards(AdminGuard)
export class GlobalRegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  getAllRegistrations() {
    return this.registrationsService.getAllRegistrationsGlobally();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RegistrationStatus,
  ) {
    return this.registrationsService.updateRegistrationStatus(id, status);
  }

  @Delete(':id')
  deleteRegistration(@Param('id') id: string) {
    return this.registrationsService.deleteRegistrationGlobally(id);
  }
}
