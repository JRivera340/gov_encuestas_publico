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

  private parseQuestion(q: Question) {
    return {
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
      config: q.config ? JSON.parse(q.config) : {},
    };
  }

  async findBySurvey(surveyId: string): Promise<any[]> {
    const questions = await this.repo.find({
      where: { surveyId },
      order: { order: 'ASC' },
    });
    return questions.map(q => this.parseQuestion(q));
  }

  async findOne(id: string): Promise<any> {
    const q = await this.repo.findOne({ where: { id } });
    if (!q) throw new NotFoundException(`Pregunta con ID ${id} no encontrada`);
    return this.parseQuestion(q);
  }

  async create(surveyId: string, dto: CreateQuestionDto): Promise<any> {
    const { options, config, ...rest } = dto;
    const question = this.repo.create({
      ...rest,
      surveyId,
      options: options ? JSON.stringify(options) : null,
      config: config ? JSON.stringify(config) : null,
    });
    const saved = await this.repo.save(question);
    return this.parseQuestion(saved);
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<any> {
    const question = await this.repo.findOne({ where: { id } });
    if (!question) throw new NotFoundException(`Pregunta no encontrada`);

    const { options, config, ...rest } = dto;
    Object.assign(question, rest);

    if (options !== undefined) {
      question.options = options ? JSON.stringify(options) : null;
    }
    if (config !== undefined) {
      question.config = config ? JSON.stringify(config) : null;
    }

    const saved = await this.repo.save(question);
    return this.parseQuestion(saved);
  }

  async remove(id: string): Promise<void> {
    const question = await this.repo.findOne({ where: { id } });
    if (question) {
      await this.repo.remove(question);
    }
  }

  async reorder(surveyId: string, orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.repo.update({ id, surveyId }, { order: index }),
      ),
    );
  }
}
