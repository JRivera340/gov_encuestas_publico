import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private readonly repo: Repository<Survey>,
  ) {}

  findAll(
    subcategoryId?: string,
    categoryName?: string,
    subcategoryName?: string,
    status?: string,
  ): Promise<Survey[]> {
    const qb = this.repo.createQueryBuilder('survey')
      .leftJoinAndSelect('survey.subcategory', 'subcategory')
      .leftJoinAndSelect('survey.questions', 'questions')
      .leftJoinAndSelect('subcategory.category', 'category')
      .orderBy('survey.createdAt', 'DESC')
      .addOrderBy('questions.order', 'ASC');

    if (subcategoryId) {
      qb.andWhere('survey.subcategoryId = :subcategoryId', { subcategoryId });
    }
    if (status) {
      qb.andWhere('survey.status = :status', { status });
    }
    if (categoryName) {
      qb.andWhere('category.name = :categoryName', { categoryName });
    }
    if (subcategoryName) {
      qb.andWhere('subcategory.name = :subcategoryName', { subcategoryName });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.repo.createQueryBuilder('survey')
      .leftJoinAndSelect('survey.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .leftJoinAndSelect('survey.questions', 'questions')
      .where('survey.id = :id', { id })
      .orderBy('questions.order', 'ASC')
      .getOne();

    if (!survey) throw new NotFoundException(`Encuesta con ID ${id} no encontrada`);
    return survey;
  }

  async create(dto: CreateSurveyDto): Promise<Survey> {
    const survey = this.repo.create(dto);
    return this.repo.save(survey);
  }

  async update(id: string, dto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    Object.assign(survey, dto);
    return this.repo.save(survey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.repo.remove(survey);
  }
}
