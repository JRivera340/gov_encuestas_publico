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

    const entidadesOptions = [
      "UAESP", "Promoambiental", "IVC", "Alcaldía Local de Santa Fé", "Policía Nacional", "Ejército Nacional", 
      "Secretaría de Gobierno", "Secretaría de Seguridad", "Inspección de Policía", "Personería", 
      "Defensoría del Pueblo", "ICBF", "Fiscalía", "Tránsito", "Bomberos", "Cruz Roja", "Defensa Civil", 
      "Integración Social", "Policía de Transito", "Secretaría de Movilidad"
    ].map(name => ({ label: name, value: name }));

    // 1. Establecimientos
    const subEst = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Establecimientos de comercio', categoryId: catIVC.id }));
    await this.seedSurvey(subEst.id, 'IVC - Establecimientos de Comercio', [
      { name: 'establecimientosVisitados', type: QuestionType.NUMBER, label: 'Establecimientos visitados', order: 10 },
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Establecimientos sellados', order: 11 },
      { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', order: 12 },
    ], entidadesOptions);

    // 2. Pagadiarios
    const subPag = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Pagadiarios', categoryId: catIVC.id }));
    await this.seedSurvey(subPag.id, 'IVC - Pagadiarios', [
      { name: 'establecimientosVisitados', type: QuestionType.NUMBER, label: 'Establecimientos visitados', order: 10 },
      { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', order: 11 },
    ], entidadesOptions);

    // 3. Parqueaderos
    const subPar = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Parqueaderos', categoryId: catIVC.id }));
    await this.seedSurvey(subPar.id, 'IVC - Parqueaderos', [
      { name: 'vehiculosReceptados', type: QuestionType.NUMBER, label: 'Vehículos receptados', order: 10 },
    ], entidadesOptions);

    // 4. 1801
    const sub1801 = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: '1801', categoryId: catEP.id }));
    await this.seedSurvey(sub1801.id, 'Espacio Público - 1801', [
      { name: 'estructurasNoConvencionales', type: QuestionType.NUMBER, label: 'Estructuras no convencionales', order: 10 },
      { name: 'm2Recuperados', type: QuestionType.NUMBER, label: 'M2 recuperados', order: 11 },
    ], entidadesOptions);

    return { message: 'Seed Completo y Formato JSON corregido', created: 4 };
  }

  private async seedSurvey(subcategoryId: string, title: string, specificQuestions: any[], entidadesOptions: any[]) {
    const questions: Partial<Question>[] = [
      { type: QuestionType.SECTION_HEADER, label: '2. Datos del Operativo', order: 1, name: 'sec_2' },
      ...specificQuestions,
      { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', order: 30, name: 'sec_3' },
      { type: QuestionType.DATE, label: 'Fecha y hora del operativo', name: 'fecha_operativo', required: true, order: 31 },
      { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', order: 40, name: 'sec_4' },
      { type: QuestionType.LOCATION, label: 'Ubicación y Barrio', name: 'ubicacion_mapa', required: true, order: 41 },
      { type: QuestionType.SECTION_HEADER, label: '7. Entidades', order: 70, name: 'sec_7' },
      { type: QuestionType.SELECT, label: 'Entidad responsable', name: 'entidad_responsable', options: entidadesOptions, order: 71 },
      { type: QuestionType.MULTISELECT, label: 'Entidades acompañantes', name: 'entidades_acompanantes', options: entidadesOptions, order: 72 },
      { type: QuestionType.SECTION_HEADER, label: '8. Operativo en Grupo', order: 80, name: 'sec_8' },
      { type: QuestionType.CHECKBOX, label: '¿Este operativo fue realizado en grupo?', name: 'en_grupo', order: 81 },
      { 
        type: QuestionType.MULTISELECT, 
        label: 'Gestores acompañantes', 
        name: 'gestores_acompanantes', 
        options: [{ label: 'Gestor 1', value: 'g1' }, { label: 'Gestor 2', value: 'g2' }],
        config: { visibleIf: { name: 'en_grupo', value: true } },
        order: 82 
      },
      { type: QuestionType.SECTION_HEADER, label: '9. Acta del Operativo', order: 90, name: 'sec_9' },
      { type: QuestionType.FILE, label: 'Acta del Operativo (PDF)', name: 'acta_pdf', order: 91 },
    ];

    const survey = await this.surveysRepo.save(this.surveysRepo.create({ title, status: SurveyStatus.ACTIVE, subcategoryId, version: 1 }));
    for (const q of questions) {
      await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: survey.id }));
    }
  }
}
