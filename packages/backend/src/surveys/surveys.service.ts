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

  private parseSurvey(s: any) {
    if (!s) return s;
    if (s.questions && Array.isArray(s.questions)) {
      s.questions = s.questions.map((q: any) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        config: q.config ? JSON.parse(q.config) : {},
      }));
    }
    return s;
  }

  async findAll(
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

    if (subcategoryId) qb.andWhere('survey.subcategoryId = :subcategoryId', { subcategoryId });
    if (status) qb.andWhere('survey.status = :status', { status });
    if (categoryName) qb.andWhere('category.name = :categoryName', { categoryName });
    if (subcategoryName) qb.andWhere('subcategory.name = :subcategoryName', { subcategoryName });

    const surveys = await qb.getMany();
    return surveys.map(s => this.parseSurvey(s));
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.repo.createQueryBuilder('survey')
      .leftJoinAndSelect('survey.subcategory', 'subcategory')
      .leftJoinAndSelect('survey.questions', 'questions')
      .leftJoinAndSelect('subcategory.category', 'category')
      .where('survey.id = :id', { id })
      .orderBy('questions.order', 'ASC')
      .getOne();

    if (!survey) throw new NotFoundException(`Encuesta con ID ${id} no encontrada`);
    return this.parseSurvey(survey);
  }

  async create(dto: CreateSurveyDto): Promise<Survey> {
    const survey = this.repo.create(dto);
    return this.repo.save(survey);
  }

  async update(id: string, dto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.repo.findOne({ where: { id } });
    if (!survey) throw new NotFoundException('Encuesta no encontrada');
    Object.assign(survey, dto);
    await this.repo.save(survey);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.repo.findOne({ where: { id } });
    if (survey) {
      await this.repo.remove(survey);
    }
  }
}
