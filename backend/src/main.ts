import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const origins = frontendUrl
    ? frontendUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : [];

  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}
void bootstrap();
