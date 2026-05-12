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

    const catIVC = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'IVC', description: 'IVC' }));
    const catEP = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'ESPACIO_PUBLICO', description: 'Espacio Público' }));
    const catAMB = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'AMBIENTAL', description: 'Ambiental' }));

    // IVC - Establecimiento de comercio (FULL FORM)
    const subIvcEst = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ 
      name: 'Establecimiento de comercio', 
      categoryId: catIVC.id 
    }));
    await this.seedFullIVCSurvey(subIvcEst.id);

    return { message: 'Seed de Formulario Completo ejecutado con éxito', created: 1 };
  }

  private async seedFullIVCSurvey(subcategoryId: string) {
    const title = 'IVC - Establecimientos de Comercio';
    const questions: Partial<Question>[] = [
      // SECCIÓN 1
      { type: QuestionType.SECTION_HEADER, label: '1. Tipo de Operativo', order: 1, name: 'sec_1' },
      { type: QuestionType.TEXT, label: 'Categoría', name: 'categoria_meta', config: JSON.stringify({ disabled: true, defaultValue: 'IVC' }), order: 2 },
      { type: QuestionType.TEXT, label: 'Subtipo', name: 'subtipo_meta', config: JSON.stringify({ disabled: true, defaultValue: 'Establecimientos de Comercio' }), order: 3 },

      // SECCIÓN 2 (Datos del Operativo)
      { type: QuestionType.SECTION_HEADER, label: '2. Datos del Operativo', order: 4, name: 'sec_2' },
      { name: 'establecimientosVisitados', type: QuestionType.NUMBER, label: 'Establecimientos Visitados', isMetric: true, order: 5 },
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Sellamientos', isMetric: true, order: 6 },
      { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', isMetric: true, order: 7 },
      { name: 'licoresAdulterados', type: QuestionType.NUMBER, label: 'Licores Adulterados', isMetric: true, order: 8 },
      { name: 'armasCortopunzantes', type: QuestionType.NUMBER, label: 'Armas Cortopunzantes', isMetric: true, order: 9 },
      { name: 'armasFuegoMunicionTraumaticas', type: QuestionType.NUMBER, label: 'Armas de Fuego / Traumáticas', isMetric: true, order: 10 },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas Sensibilizadas', isMetric: true, order: 11 },
      { name: 'menoresEdad', type: QuestionType.NUMBER, label: 'Menores de Edad', isMetric: true, order: 12 },
      { name: 'kgAproximadoPolvora', type: QuestionType.NUMBER, label: 'Kg Polvora', isMetric: true, order: 13 },
      { name: 'gramosSpa', type: QuestionType.NUMBER, label: 'Gramos SPA', isMetric: true, order: 14 },
      { name: 'personasTrasladadasCtp', type: QuestionType.NUMBER, label: 'Personas trasladadas CTP', isMetric: true, order: 15 },
      { name: 'personasCapturadas', type: QuestionType.NUMBER, label: 'Personas Capturadas', isMetric: true, order: 16 },
      { name: 'vendedoresInformalesRetirados', type: QuestionType.NUMBER, label: 'Vendedores Informales Retirados', isMetric: true, order: 17 },
      { name: 'vendedoresInformalesIntervenidos', type: QuestionType.NUMBER, label: 'Vendedores Informales Intervenidos', isMetric: true, order: 18 },

      // SECCIÓN 3
      { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', order: 19, name: 'sec_3' },
      { type: QuestionType.DATE, label: 'Fecha y hora del operativo', name: 'fecha_operativo', required: true, order: 20 },

      // SECCIÓN 4
      { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', order: 21, name: 'sec_4' },
      { type: QuestionType.LOCATION, label: 'Ubicación y Barrio', name: 'ubicacion_mapa', required: true, order: 22 },

      // SECCIÓN 5
      { type: QuestionType.SECTION_HEADER, label: '5. Descripción', order: 23, name: 'sec_5' },
      { type: QuestionType.TEXTAREA, label: 'Descripción general', name: 'descripcion_general', required: true, order: 24 },

      // SECCIÓN 6
      { type: QuestionType.SECTION_HEADER, label: '6. Evidencia Fotográfica', order: 25, name: 'sec_6' },
      { type: QuestionType.FILE, label: 'Fotos de Evidencia', name: 'fotos_evidencia', config: JSON.stringify({ maxFiles: 5, maxSizeMB: 10 }), order: 26 },

      // SECCIÓN 7
      { type: QuestionType.SECTION_HEADER, label: '7. Entidades', order: 27, name: 'sec_7' },
      { type: QuestionType.SELECT, label: 'Entidad responsable', name: 'entidad_responsable', options: JSON.stringify([
        { label: 'Secretaría de Gobierno', value: 'gobierno' },
        { label: 'Policía Nacional', value: 'policia' },
        { label: 'UAESP', value: 'uaesp' }
      ]), order: 28 },
      { type: QuestionType.MULTISELECT, label: 'Entidades acompañantes', name: 'entidades_acompanantes', options: JSON.stringify([
        { label: 'UAESP', value: 'uaesp' },
        { label: 'Policía Nacional', value: 'policia' },
        { label: 'Ejército Nacional', value: 'ejercito' }
      ]), order: 29 },

      // SECCIÓN 8
      { type: QuestionType.SECTION_HEADER, label: '8. Operativo en Grupo', order: 30, name: 'sec_8' },
      { type: QuestionType.CHECKBOX, label: '¿Este operativo fue realizado en grupo?', name: 'en_grupo', order: 31 },

      // SECCIÓN 9
      { type: QuestionType.SECTION_HEADER, label: '9. Acta del Operativo', order: 32, name: 'sec_9' },
      { type: QuestionType.FILE, label: 'Acta del Operativo (PDF)', name: 'acta_pdf', config: JSON.stringify({ accept: 'application/pdf' }), order: 33 },
    ];

    const survey = await this.surveysRepo.save(this.surveysRepo.create({
      title,
      status: SurveyStatus.ACTIVE,
      subcategoryId,
      version: 1,
    }));

    for (const q of questions) {
      await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: survey.id }));
    }
  }
}
