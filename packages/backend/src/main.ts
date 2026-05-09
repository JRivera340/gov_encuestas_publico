import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: Restringir origin al dominio de gov_espacio_público en producción
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const seedService = app.get(SeedService);
  await seedService.run();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend corriendo en puerto ${process.env.PORT ?? 3000}`);
}
bootstrap();
