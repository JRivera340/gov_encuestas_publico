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

    // CATEGORÍAS (Nombres amigables para el usuario)
    const catIVC = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'IVC', description: 'Inspección, Vigilancia y Control' }));
    const catEP = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'Espacio Público', description: 'Gestión de Espacio Público' }));
    const catAMB = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'Ambiental', description: 'Gestión Ambiental' }));

    // --- IVC ---
    const subEst = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Establecimientos de comercio', categoryId: catIVC.id }));
    await this.seedFullSurvey(subEst.id, 'IVC - Establecimientos de Comercio', 'IVC', 'Establecimientos de comercio');

    const subPag = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Pagadiarios', categoryId: catIVC.id }));
    await this.seedFullSurvey(subPag.id, 'IVC - Pagadiarios', 'IVC', 'Pagadiarios');

    const subPar = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Parqueaderos', categoryId: catIVC.id }));
    await this.seedFullSurvey(subPar.id, 'IVC - Parqueaderos', 'IVC', 'Parqueaderos');

    // --- Espacio Público ---
    const sub1801 = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: '1801', categoryId: catEP.id }));
    await this.seedFullSurvey(sub1801.id, 'Espacio Público - 1801', 'Espacio Público', '1801');

    // --- Ambiental ---
    const subAmb = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Ambiente', categoryId: catAMB.id }));
    await this.seedFullSurvey(subAmb.id, 'Ambiental - General', 'Ambiental', 'Ambiente');

    return { message: 'Seed con nombres amigables ejecutado', created: 5 };
  }

  private async seedFullSurvey(subcategoryId: string, title: string, categoryName: string, subtypeName: string) {
    const questions: Partial<Question>[] = [
      { type: QuestionType.SECTION_HEADER, label: '1. Tipo de Operativo', order: 1, name: 'sec_1' },
      { type: QuestionType.TEXT, label: 'Categoría', name: 'categoria_meta', config: JSON.stringify({ disabled: true, defaultValue: categoryName }), order: 2 },
      { type: QuestionType.TEXT, label: 'Subtipo', name: 'subtipo_meta', config: JSON.stringify({ disabled: true, defaultValue: subtypeName }), order: 3 },
      { type: QuestionType.SECTION_HEADER, label: '2. Datos del Operativo', order: 4, name: 'sec_2' },
      { name: 'dato_ejemplo', type: QuestionType.NUMBER, label: 'Campo de ejemplo', isMetric: true, order: 5 },
      { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', order: 6, name: 'sec_3' },
      { type: QuestionType.DATE, label: 'Fecha y hora', name: 'fecha_operativo', required: true, order: 7 },
      { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', order: 8, name: 'sec_4' },
      { type: QuestionType.LOCATION, label: 'Mapa', name: 'ubicacion_mapa', required: true, order: 9 },
      { type: QuestionType.SECTION_HEADER, label: '5. Descripción', order: 10, name: 'sec_5' },
      { type: QuestionType.TEXTAREA, label: 'Descripción', name: 'descripcion_general', required: true, order: 11 },
      { type: QuestionType.SECTION_HEADER, label: '6. Evidencia', order: 12, name: 'sec_6' },
      { type: QuestionType.FILE, label: 'Fotos', name: 'fotos_evidencia', order: 13 },
    ];

    const survey = await this.surveysRepo.save(this.surveysRepo.create({ title, status: SurveyStatus.ACTIVE, subcategoryId, version: 1 }));
    for (const q of questions) {
      await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: survey.id }));
    }
  }
}
