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
    let created = 0;

    // 1. Categorías Base
    const categoriesData = [
      { name: 'IVC', description: 'Inspección, Vigilancia y Control' },
      { name: 'ESPACIO_PUBLICO', description: 'Gestión y control del espacio público' },
      { name: 'AMBIENTAL', description: 'Gestión ambiental y de residuos' },
    ];

    for (const cat of categoriesData) {
      let category = await this.categoriesRepo.findOne({ where: { name: cat.name } });
      if (!category) {
        category = await this.categoriesRepo.save(this.categoriesRepo.create(cat));
        created++;
      }

      // 2. Subcategorías
      if (cat.name === 'AMBIENTAL') {
        const sub = await this.ensureSubcategory('Ambiente', 'Inspección ambiental general', category.id);
        if (sub) {
          created++;
          await this.seedAmbientalSurvey(sub.id);
        }
      } else if (cat.name === 'IVC') {
        const sub = await this.ensureSubcategory('Establecimientos de Comercio', 'Control de establecimientos', category.id);
        if (sub) {
          created++;
          await this.seedIVCSurvey(sub.id);
        }
      }
    }

    return { message: 'Seed ejecutado correctamente', created };
  }

  private async ensureSubcategory(name: string, description: string, categoryId: string) {
    let sub = await this.subcategoriesRepo.findOne({ where: { name, categoryId } });
    if (!sub) {
      sub = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name, description, categoryId }));
    }
    return sub;
  }

  private async seedAmbientalSurvey(subcategoryId: string) {
    const title = 'Operativo Ambiental';
    let survey = await this.surveysRepo.findOne({ where: { title, subcategoryId } });
    
    if (!survey) {
      survey = await this.surveysRepo.save(this.surveysRepo.create({
        title,
        description: 'Formulario para el registro de operativos ambientales y manejo de residuos.',
        status: SurveyStatus.ACTIVE,
        subcategoryId,
        version: 1,
      }));

      const questions: Partial<Question>[] = [
        { name: 'sec_1', type: QuestionType.SECTION_HEADER, label: '1. Tipo de Operativo', order: 1 },
        { name: 'categoria_fija', type: QuestionType.TEXT, label: 'Categoría', placeholder: 'Ambiental', config: JSON.stringify({ disabled: true, value: 'Ambiental' }), order: 2 },
        { name: 'subtipo_fijo', type: QuestionType.TEXT, label: 'Subtipo', placeholder: 'Ambiental', config: JSON.stringify({ disabled: true, value: 'Ambiental' }), order: 3 },
        
        { name: 'sec_2', type: QuestionType.SECTION_HEADER, label: '2. Datos del Operativo', order: 4 },
        { name: 'puntos_residuos', type: QuestionType.NUMBER, label: 'Puntos de residuos emergentes atendidos', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 5 },
        { name: 'comparendos_pedagogicos', type: QuestionType.NUMBER, label: 'Comparendos pedagógicos', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 6 },
        { name: 'comparendos', type: QuestionType.NUMBER, label: 'Comparendos', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 7 },
        { name: 'personas_sensibilizadas', type: QuestionType.NUMBER, label: 'Personas sensibilizadas', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 8 },
        { name: 'huertas', type: QuestionType.NUMBER, label: 'Huertas', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 9 },
        { name: 'kg_residuos', type: QuestionType.NUMBER, label: 'Kg de Material de Residuos Recolectados', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 10 },
        { name: 'm2_recuperados', type: QuestionType.NUMBER, label: 'M2 recuperados de espacio público', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 11 },
        
        { name: 'sec_3', type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', order: 12 },
        { name: 'fecha_operativo', type: QuestionType.DATE, label: 'Fecha y hora del operativo', required: true, order: 13 },
        
        { name: 'sec_4', type: QuestionType.SECTION_HEADER, label: '4. Ubicación', order: 14 },
        { name: 'ubicacion_mapa', type: QuestionType.LOCATION, label: 'Ubicación del operativo', required: true, config: JSON.stringify({ useLeaflet: true, detectNeighborhood: true }), order: 15 },
        
        { name: 'sec_5', type: QuestionType.SECTION_HEADER, label: '5. Descripción', order: 16 },
        { name: 'descripcion_general', type: QuestionType.TEXTAREA, label: 'Descripción general', placeholder: 'Describe brevemente los resultados...', required: true, order: 17 },
        
        { name: 'sec_6', type: QuestionType.SECTION_HEADER, label: '6. Evidencia Fotográfica', order: 18 },
        { name: 'fotos_evidencia', type: QuestionType.FILE, label: 'Fotos de Evidencia', config: JSON.stringify({ maxFiles: 5, maxSizeMB: 10, accept: 'image/*' }), order: 19 },
        
        { name: 'sec_7', type: QuestionType.SECTION_HEADER, label: '7. Entidades', order: 20 },
        { name: 'entidad_responsable', type: QuestionType.SELECT, label: 'Entidad responsable', options: JSON.stringify([{ label: 'Secretaría de Gobierno', value: 'gobierno' }, { label: 'Policía', value: 'policia' }]), order: 21 },
        { name: 'entidades_acompanantes', type: QuestionType.ENTITY_SELECT, label: 'Entidades acompañantes', order: 22 },
        
        { name: 'sec_8', type: QuestionType.SECTION_HEADER, label: '8. Operativo en Grupo', order: 23 },
        { name: 'en_grupo', type: QuestionType.CHECKBOX, label: '¿Este operativo fue realizado en grupo?', order: 24 },
        
        { name: 'sec_9', type: QuestionType.SECTION_HEADER, label: '9. Acta del Operativo', order: 25 },
        { name: 'acta_pdf', type: QuestionType.FILE, label: 'Acta del Operativo (PDF)', config: JSON.stringify({ minPages: 3, maxSizeMB: 10, accept: 'application/pdf' }), order: 26 },
      ];

      for (const q of questions) {
        await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: survey.id }));
      }
    }
  }

  private async seedIVCSurvey(subcategoryId: string) {
    const title = 'Operativo IVC';
    let survey = await this.surveysRepo.findOne({ where: { title, subcategoryId } });
    
    if (!survey) {
      survey = await this.surveysRepo.save(this.surveysRepo.create({
        title,
        description: 'Formulario para Inspección, Vigilancia y Control de establecimientos.',
        status: SurveyStatus.ACTIVE,
        subcategoryId,
        version: 1,
      }));

      const questions: Partial<Question>[] = [
        { name: 'sec_1', type: QuestionType.SECTION_HEADER, label: '1. Tipo de Operativo', order: 1 },
        { name: 'categoria_ivc', type: QuestionType.TEXT, label: 'Categoría', placeholder: 'IVC', config: JSON.stringify({ disabled: true, value: 'IVC' }), order: 2 },
        { name: 'subtipo_ivc', type: QuestionType.TEXT, label: 'Subtipo', placeholder: 'Establecimientos de Comercio', config: JSON.stringify({ disabled: true, value: 'Establecimientos de Comercio' }), order: 3 },

        { name: 'sec_2', type: QuestionType.SECTION_HEADER, label: '2. Datos del Operativo', order: 4 },
        { name: 'establecimientos_visitados', type: QuestionType.NUMBER, label: 'Establecimientos visitados', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 5 },
        { name: 'establecimientos_sellados', type: QuestionType.NUMBER, label: 'Establecimientos sellados', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 6 },
        { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 7 },
        { name: 'licores_incautados', type: QuestionType.NUMBER, label: 'Licores adulterados incautados', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 8 },
        { name: 'armas_incautadas', type: QuestionType.NUMBER, label: 'Armas cortopunzantes incautadas', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 9 },
        { name: 'personas_sensibilizadas_ivc', type: QuestionType.NUMBER, label: 'Personas sensibilizadas', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 10 },
        { name: 'menores_edad', type: QuestionType.NUMBER, label: 'Menores de edad', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 11 },
        { name: 'vendedores_retirados', type: QuestionType.NUMBER, label: 'Vendedores informales retirados', config: JSON.stringify({ min: 0, defaultValue: 0 }), order: 12 },
        
        { name: 'sec_3', type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', order: 13 },
        { name: 'fecha_ivc', type: QuestionType.DATE, label: 'Fecha y hora del operativo', required: true, order: 14 },
        
        { name: 'sec_4', type: QuestionType.SECTION_HEADER, label: '4. Ubicación', order: 15 },
        { name: 'ubicacion_ivc', type: QuestionType.LOCATION, label: 'Ubicación', required: true, order: 16 },

        { name: 'sec_5', type: QuestionType.SECTION_HEADER, label: '5. Descripción', order: 17 },
        { name: 'descripcion_ivc', type: QuestionType.TEXTAREA, label: 'Descripción general', required: true, order: 18 },

        { name: 'sec_6', type: QuestionType.SECTION_HEADER, label: '6. Evidencia Fotográfica', order: 19 },
        { name: 'fotos_ivc', type: QuestionType.FILE, label: 'Fotos de Evidencia', order: 20 },

        { name: 'sec_7', type: QuestionType.SECTION_HEADER, label: '7. Entidades', order: 21 },
        { name: 'entidades_ivc', type: QuestionType.ENTITY_SELECT, label: 'Entidades acompañantes', order: 22 },

        { name: 'sec_9', type: QuestionType.SECTION_HEADER, label: '9. Acta', order: 23 },
        { name: 'acta_ivc', type: QuestionType.FILE, label: 'Acta del Operativo (PDF)', order: 24 },
      ];

      for (const q of questions) {
        await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: survey.id }));
      }
    }
  }
}
