import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/category.entity';
import { Subcategory } from '../subcategories/subcategory.entity';
import { Survey } from '../surveys/survey.entity';
import { Question } from '../questions/question.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory, Survey, Question])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
