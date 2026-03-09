import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set Winston as the logger for the Nest application
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // 🚀 This line is required for Prisma's onModuleDestroy to work!
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  // Use the logger to signal the app is up
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();