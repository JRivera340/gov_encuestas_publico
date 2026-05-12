import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Subcategory } from '../subcategories/subcategory.entity';
import { Survey, SurveyStatus } from '../surveys/survey.entity';
import { Question, QuestionType } from '../questions/question.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoriesRepo: Repository<Subcategory>,
    @InjectRepository(Survey)
    private readonly surveysRepo: Repository<Survey>,
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {}

  async run(): Promise<{ message: string; created: number }> {
    await this.questionsRepo.createQueryBuilder().delete().execute();
    await this.surveysRepo.createQueryBuilder().delete().execute();
    await this.subcategoriesRepo.createQueryBuilder().delete().execute();
    await this.categoriesRepo.createQueryBuilder().delete().execute();

    const catIVC = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'IVC' }));
    const catEP = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'Espacio Público' }));

    const entidadesList = [
      "UAESP", "Promoambiental", "IVC", "Alcaldía Local de Santa Fé", "Policía Nacional", "Ejército Nacional", 
      "Secretaría de Gobierno", "Secretaría de Seguridad", "Inspección de Policía", "Personería", 
      "Defensoría del Pueblo", "ICBF", "Fiscalía", "Tránsito", "Bomberos", "Cruz Roja", "Defensa Civil", 
      "Integración Social", "Policía de Transito", "Secretaría de Movilidad"
    ].map(name => ({ label: name, value: name.toLowerCase().replace(/ /g, '_') }));

    const entidadesOptions = JSON.stringify(entidadesList);

    const subEst = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Establecimientos de comercio', categoryId: catIVC.id }));
    
    const questions: Partial<Question>[] = [
      { type: QuestionType.SECTION_HEADER, label: '7. Entidades', order: 70, name: 'sec_7' },
      { 
        type: QuestionType.SELECT, 
        label: 'Entidad responsable', 
        name: 'entidad_responsable', 
        options: entidadesOptions,
        order: 71 
      },
      { 
        type: QuestionType.MULTISELECT, 
        label: 'Entidades acompañantes', 
        name: 'entidades_acompanantes', 
        options: entidadesOptions,
        order: 72 
      },
      { type: QuestionType.SECTION_HEADER, label: '8. Operativo en Grupo', order: 80, name: 'sec_8' },
      { type: QuestionType.CHECKBOX, label: '¿Este operativo fue realizado en grupo?', name: 'en_grupo', order: 81 },
      { 
        type: QuestionType.MULTISELECT, 
        label: 'Gestores acompañantes', 
        name: 'gestores_acompanantes', 
        options: JSON.stringify([
          { label: 'Gestor de Prueba 1', value: 'g1' },
          { label: 'Gestor de Prueba 2', value: 'g2' }
        ]),
        config: JSON.stringify({ visibleIf: { name: 'en_grupo', value: true } }),
        order: 82 
      },
    ];

    await this.surveysRepo.save(this.surveysRepo.create({ 
      title: 'IVC - Establecimientos', 
      status: SurveyStatus.ACTIVE, 
      subcategoryId: subEst.id, 
      version: 1 
    }));

    for (const q of questions) {
      await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: (await this.surveysRepo.find())[0].id }));
    }

    return { message: 'Seed con lista de entidades completa ejecutado', created: 1 };
  }
}
