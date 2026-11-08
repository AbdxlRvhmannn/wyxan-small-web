import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;
  await app.listen(port);
}
await bootstrap();
