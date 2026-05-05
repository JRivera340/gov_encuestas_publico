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

  findAll(subcategoryId?: string): Promise<Survey[]> {
    const where = subcategoryId ? { subcategoryId } : {};
    return this.repo.find({
      where,
      relations: ['subcategory', 'subcategory.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.repo.findOne({
      where: { id },
      relations: ['subcategory', 'subcategory.category'],
    });
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
