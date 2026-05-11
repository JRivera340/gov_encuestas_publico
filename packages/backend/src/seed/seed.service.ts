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
    // LIMPIEZA TOTAL para asegurar nombres frescos
    await this.questionsRepo.delete({});
    await this.surveysRepo.delete({});
    await this.subcategoriesRepo.delete({});
    await this.categoriesRepo.delete({});

    // 1. Categorías (Nombres exactos del mapeo)
    const catIVC = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'IVC', description: 'IVC' }));
    const catEP = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'ESPACIO_PUBLICO', description: 'Espacio Público' }));
    const catAMB = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'AMBIENTAL', description: 'Ambiental' }));

    // 2. Subcategorías (Nombres EXACTOS que usa el fetch de la otra IA)
    
    // IVC - Establecimiento de comercio
    const subIvcEst = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ 
      name: 'Establecimiento de comercio', 
      categoryId: catIVC.id 
    }));
    await this.seedSurvey(subIvcEst.id, 'IVC - Establecimientos', [
      { name: 'establecimientosVisitados', type: QuestionType.NUMBER, label: 'Establecimientos Visitados', isMetric: true },
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Sellamientos', isMetric: true },
      { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', isMetric: true },
      { name: 'licoresAdulterados', type: QuestionType.NUMBER, label: 'Licores Adulterados', isMetric: true },
      { name: 'armasCortopunzantes', type: QuestionType.NUMBER, label: 'Armas Cortopunzantes', isMetric: true },
      { name: 'armasFuegoMunicionTraumaticas', type: QuestionType.NUMBER, label: 'Armas de Fuego / Traumáticas', isMetric: true },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas Sensibilizadas', isMetric: true },
      { name: 'menoresEdad', type: QuestionType.NUMBER, label: 'Menores de Edad', isMetric: true },
      { name: 'kgAproximadoPolvora', type: QuestionType.NUMBER, label: 'Kg Polvora', isMetric: true },
      { name: 'gramosSpa', type: QuestionType.NUMBER, label: 'Gramos SPA', isMetric: true },
      { name: 'personasTrasladadasCtp', type: QuestionType.NUMBER, label: 'Personas trasladadas CTP', isMetric: true },
      { name: 'personasCapturadas', type: QuestionType.NUMBER, label: 'Personas Capturadas', isMetric: true },
      { name: 'vendedoresInformalesRetirados', type: QuestionType.NUMBER, label: 'Vendedores Informales Retirados', isMetric: true },
      { name: 'vendedoresInformalesIntervenidos', type: QuestionType.NUMBER, label: 'Vendedores Informales Intervenidos', isMetric: true },
    ]);

    // IVC - Estacionamiento (Así lo tiene mapeado ella para Parqueaderos)
    const subIvcPar = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ 
      name: 'Estacionamiento', 
      categoryId: catIVC.id 
    }));
    await this.seedSurvey(subIvcPar.id, 'IVC - Parqueaderos', [
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Sellamientos', isMetric: true },
      { name: 'vehiculosReceptados', type: QuestionType.NUMBER, label: 'Vehículos Receptados', isMetric: true },
    ]);

    // Espacio Público - 1801
    const subEP1801 = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ 
      name: '1801', 
      categoryId: catEP.id 
    }));
    await this.seedSurvey(subEP1801.id, 'Espacio Público - 1801', [
      { name: 'estructurasNoConvencionales', type: QuestionType.NUMBER, label: 'Estructuras No Convencionales', isMetric: true },
      { name: 'cambuches', type: QuestionType.NUMBER, label: 'Cambuches', isMetric: true },
      { name: 'cachivacherosIntervenidos', type: QuestionType.NUMBER, label: 'Cachivacheros Intervenidos', isMetric: true },
      { name: 'comparendos', type: QuestionType.NUMBER, label: 'Comparendos', isMetric: true },
      { name: 'armasCortopunzantes', type: QuestionType.NUMBER, label: 'Armas Cortopunzantes', isMetric: true },
      { name: 'armasFuego', type: QuestionType.NUMBER, label: 'Armas de Fuego', isMetric: true },
      { name: 'mendicidad', type: QuestionType.NUMBER, label: 'Mendicidad', isMetric: true },
      { name: 'trasladadosCtp', type: QuestionType.NUMBER, label: 'Trasladados CTP', isMetric: true },
      { name: 'capturados', type: QuestionType.NUMBER, label: 'Capturados', isMetric: true },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas Sensibilizadas', isMetric: true },
      { name: 'kgMercanciaIncautada', type: QuestionType.NUMBER, label: 'Kg Mercancía Incautada', isMetric: true },
      { name: 'pipetasIncautadas', type: QuestionType.NUMBER, label: 'Pipetas Incautadas', isMetric: true },
      { name: 'bicicletasRecuperadas', type: QuestionType.NUMBER, label: 'Bicicletas Recuperadas', isMetric: true },
      { name: 'celularesRecuperados', type: QuestionType.NUMBER, label: 'Celulares Recuperados', isMetric: true },
      { name: 'carretasIncautadas', type: QuestionType.NUMBER, label: 'Carretas Incautadas', isMetric: true },
      { name: 'vendedoresInformalesRetirados', type: QuestionType.NUMBER, label: 'Vendedores Informales Retirados', isMetric: true },
      { name: 'vendedoresInformalesIntervenidos', type: QuestionType.NUMBER, label: 'Vendedores Informales Intervenidos', isMetric: true },
      { name: 'm2RecuperadosEspacioPublico', type: QuestionType.NUMBER, label: 'M2 Recuperados', isMetric: true },
    ]);

    // Ambiental - Ambiente (Así lo tiene mapeado ella para AMBIENTAL)
    const subAmb = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ 
      name: 'Ambiente', 
      categoryId: catAMB.id 
    }));
    await this.seedSurvey(subAmb.id, 'Ambiental - General', [
      { name: 'puntosCriticosEmergentesAtendidos', type: QuestionType.NUMBER, label: 'Puntos Críticos Atendidos', isMetric: true },
      { name: 'comparendosPedagogicos', type: QuestionType.NUMBER, label: 'Comparendos Pedagógicos', isMetric: true },
      { name: 'comparendos', type: QuestionType.NUMBER, label: 'Comparendos', isMetric: true },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas Sensibilizadas', isMetric: true },
      { name: 'huertas', type: QuestionType.NUMBER, label: 'Huertas', isMetric: true },
      { name: 'kgMaterialResiduosRecolectados', type: QuestionType.NUMBER, label: 'Kg Residuos Recolectados', isMetric: true },
      { name: 'm2RecuperadosEspacioPublico', type: QuestionType.NUMBER, label: 'M2 Recuperados', isMetric: true },
    ]);

    return { message: 'Seed total completado con éxito', created: 4 };
  }

  private async seedSurvey(subcategoryId: string, title: string, questions: any[]) {
    const survey = await this.surveysRepo.save(this.surveysRepo.create({
      title,
      status: SurveyStatus.ACTIVE,
      subcategoryId,
      version: 1,
    }));

    for (let i = 0; i < questions.length; i++) {
      await this.questionsRepo.save(this.questionsRepo.create({
        ...questions[i],
        surveyId: survey.id,
        order: i,
      }));
    }
  }
}
