import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Garantiza que la columna visibleRoles exista en producción (Postgres) sin
  // depender de SYNCHRONIZE. Idempotente y seguro: si ya existe, no hace nada.
  if (process.env.DATABASE_URL) {
    try {
      const ds = app.get(DataSource);
      await ds.query('ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "visibleRoles" text');
    } catch (err) {
      console.error('[bootstrap] No se pudo asegurar la columna visibleRoles:', err);
    }
  }

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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend corriendo en puerto ${process.env.PORT ?? 3000}`);
}
bootstrap();
