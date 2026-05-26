import { IsEnum, IsOptional } from 'class-validator';
import { GlobalRole } from '@prisma/client';

export class UpdateUserDto {
  @IsEnum(GlobalRole)
  @IsOptional()
  role?: GlobalRole;
}
