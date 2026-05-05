import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly repo: Repository<Question>,
  ) {}

  findBySurvey(surveyId: string): Promise<Question[]> {
    return this.repo.find({
      where: { surveyId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Question> {
    const q = await this.repo.findOne({ where: { id } });
    if (!q) throw new NotFoundException(`Pregunta con ID ${id} no encontrada`);
    return q;
  }

  async create(surveyId: string, dto: CreateQuestionDto): Promise<Question> {
    const { options, ...rest } = dto;
    const question = this.repo.create({
      ...rest,
      surveyId,
      options: options ? JSON.stringify(options) : null,
    });
    return this.repo.save(question);
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findOne(id);
    const { options, ...rest } = dto;
    Object.assign(question, rest);
    if (options !== undefined) {
      question.options = options ? JSON.stringify(options) : null;
    }
    return this.repo.save(question);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.repo.remove(question);
  }

  async reorder(surveyId: string, orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.repo.update({ id, surveyId }, { order: index }),
      ),
    );
  }
}
