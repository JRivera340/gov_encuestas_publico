import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { SurveysModule } from './surveys/surveys.module';
import { QuestionsModule } from './questions/questions.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...(process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : {
            type: 'better-sqlite3',
            database: process.env.SQLITE_PATH || 'database.sqlite',
          }),
      autoLoadEntities: true,
      synchronize: process.env.SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
    }),
    CategoriesModule,
    SubcategoriesModule,
    SurveysModule,
    QuestionsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
