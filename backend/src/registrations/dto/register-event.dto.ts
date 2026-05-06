import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterEventDto {
  @IsString()
  @IsNotEmpty()
  event_id?: string;
}
