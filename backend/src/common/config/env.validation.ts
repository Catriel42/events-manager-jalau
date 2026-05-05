import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  validateSync,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string = '15m';

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL!: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:4200';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formatted = errors
      .map((err) => {
        const constraints = Object.values(err.constraints ?? {}).join(', ');
        return `  - ${err.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `\nEnvironment validation failed:\n${formatted}\n\nCheck your .env file against .env.example\n`,
    );
  }

  return validatedConfig;
}
