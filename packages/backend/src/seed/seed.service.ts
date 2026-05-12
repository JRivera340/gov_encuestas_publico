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

    const catIVC = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'IVC', description: 'Inspección, Vigilancia y Control' }));
    const catEP = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'Espacio Público', description: 'Gestión de Espacio Público' }));
    const catAMB = await this.categoriesRepo.save(this.categoriesRepo.create({ name: 'Ambiental', description: 'Gestión Ambiental' }));

    // --- IVC ---
    const subEst = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Establecimientos de comercio', categoryId: catIVC.id }));
    await this.seedSurvey(subEst.id, 'IVC - Establecimientos de Comercio', [
      { name: 'establecimientosVisitados', type: QuestionType.NUMBER, label: 'Establecimientos visitados', order: 10 },
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Establecimientos sellados', order: 11 },
      { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', order: 12 },
      { name: 'licoresAdulterados', type: QuestionType.NUMBER, label: 'Licores adulterados incautados', order: 13 },
      { name: 'armasCortopunzantes', type: QuestionType.NUMBER, label: 'Armas cortopunzantes incautadas', order: 14 },
      { name: 'armasFuegoMunicionTraumaticas', type: QuestionType.NUMBER, label: 'Armas de fuego / munición / traumáticas incautadas', order: 15 },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas sensibilizadas', order: 16 },
      { name: 'menoresEdad', type: QuestionType.NUMBER, label: 'Menores de edad', order: 17 },
      { name: 'kgAproximadoPolvora', type: QuestionType.NUMBER, label: 'Kg aproximados de pólvora incautados', order: 18 },
      { name: 'gramosSpa', type: QuestionType.NUMBER, label: 'Gramos de SPA incautados', order: 19 },
      { name: 'personasTrasladadasCtp', type: QuestionType.NUMBER, label: 'Personas trasladadas a CTP', order: 20 },
      { name: 'personasCapturadas', type: QuestionType.NUMBER, label: 'Personas capturadas', order: 21 },
      { name: 'vendedoresInformalesRetirados', type: QuestionType.NUMBER, label: 'Vendedores informales retirados', order: 22 },
      { name: 'vendedoresInformalesIntervenidos', type: QuestionType.NUMBER, label: 'Vendedores informales intervenidos', order: 23 },
    ]);

    const subPag = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Pagadiarios', categoryId: catIVC.id }));
    await this.seedSurvey(subPag.id, 'IVC - Pagadiarios', [
      { name: 'establecimientosVisitados', type: QuestionType.NUMBER, label: 'Establecimientos visitados', order: 10 },
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Establecimientos sellados', order: 11 },
      { name: 'incautaciones', type: QuestionType.NUMBER, label: 'Incautaciones', order: 12 },
      { name: 'armasCortopunzantes', type: QuestionType.NUMBER, label: 'Armas cortopunzantes incautadas', order: 13 },
      { name: 'armasFuegoMunicionTraumaticas', type: QuestionType.NUMBER, label: 'Armas de fuego / munición / traumáticas incautadas', order: 14 },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas sensibilizadas', order: 15 },
      { name: 'menoresEdad', type: QuestionType.NUMBER, label: 'Menores de edad', order: 16 },
      { name: 'kgAproximadoPolvora', type: QuestionType.NUMBER, label: 'Kg aproximados de pólvora incautados', order: 17 },
      { name: 'gramosSpa', type: QuestionType.NUMBER, label: 'Gramos de SPA incautados', order: 18 },
      { name: 'personasTrasladadasCtp', type: QuestionType.NUMBER, label: 'Personas trasladadas a CTP', order: 19 },
      { name: 'personasCapturadas', type: QuestionType.NUMBER, label: 'Personas capturadas', order: 20 },
      { name: 'vendedoresInformalesRetirados', type: QuestionType.NUMBER, label: 'Vendedores informales retirados', order: 21 },
      { name: 'vendedoresInformalesIntervenidos', type: QuestionType.NUMBER, label: 'Vendedores informales intervenidos', order: 22 },
    ]);

    const subPar = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Parqueaderos', categoryId: catIVC.id }));
    await this.seedSurvey(subPar.id, 'IVC - Parqueaderos', [
      { name: 'sellamientos', type: QuestionType.CHECKBOX, label: 'Establecimientos sellados', order: 10 },
      { name: 'vehiculosReceptados', type: QuestionType.NUMBER, label: 'Vehículos receptados', order: 11 },
    ]);

    // --- Espacio Público ---
    const sub1801 = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: '1801', categoryId: catEP.id }));
    await this.seedSurvey(sub1801.id, 'Espacio Público - 1801', [
      { name: 'estructurasNoConvencionales', type: QuestionType.NUMBER, label: 'Estructuras no convencionales intervenidas', order: 10 },
      { name: 'cambuches', type: QuestionType.NUMBER, label: 'Cambuches intervenidos', order: 11 },
      { name: 'cachivacheros', type: QuestionType.NUMBER, label: 'Cachivacheros intervenidos', order: 12 },
      { name: 'comparendos', type: QuestionType.NUMBER, label: 'Comparendos impuestos', order: 13 },
      { name: 'armasCortopunzantes', type: QuestionType.NUMBER, label: 'Armas cortopunzantes incautadas', order: 14 },
      { name: 'armasFuego', type: QuestionType.NUMBER, label: 'Armas de Fuego Incautadas', order: 15 },
      { name: 'mendicidad', type: QuestionType.NUMBER, label: 'Personas en situación de mendicidad identificadas', order: 16 },
      { name: 'trasladadosCtp', type: QuestionType.NUMBER, label: 'Trasladados a CTP', order: 17 },
      { name: 'capturados', type: QuestionType.NUMBER, label: 'Capturados', order: 18 },
      { name: 'personasSensibilizadas', type: QuestionType.NUMBER, label: 'Personas sensibilizadas', order: 19 },
      { name: 'kgMercancia', type: QuestionType.NUMBER, label: 'Kg de mercancía incautada', order: 20 },
      { name: 'pipetas', type: QuestionType.NUMBER, label: 'Pipetas incautadas', order: 21 },
      { name: 'bicicletas', type: QuestionType.NUMBER, label: 'Bicicletas recuperadas', order: 22 },
      { name: 'celulares', type: QuestionType.NUMBER, label: 'Celulares recuperados', order: 23 },
      { name: 'carretas', type: QuestionType.NUMBER, label: 'Carretas incautadas', order: 24 },
      { name: 'vendedoresInformalesRetirados', type: QuestionType.NUMBER, label: 'Vendedores informales retirados', order: 25 },
      { name: 'vendedoresInformalesIntervenidos', type: QuestionType.NUMBER, label: 'Vendedores informales intervenidos', order: 26 },
      { name: 'm2Recuperados', type: QuestionType.NUMBER, label: 'M2 recuperados de espacio público', order: 27 },
    ]);

    // --- Ambiental (Base para futuro) ---
    const subAmb = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: 'Ambiente', categoryId: catAMB.id }));
    await this.seedSurvey(subAmb.id, 'Ambiental - General', []);

    return { message: 'Seed total completado con éxito', created: 5 };
  }

  private async seedSurvey(subcategoryId: string, title: string, specificQuestions: any[]) {
    const questions: Partial<Question>[] = [
      { type: QuestionType.SECTION_HEADER, label: '2. Datos del Operativo', order: 1, name: 'sec_2' },
      ...specificQuestions,
      { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', order: 30, name: 'sec_3' },
      { type: QuestionType.DATE, label: 'Fecha y hora del operativo', name: 'fecha_operativo', required: true, order: 31 },
      { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', order: 40, name: 'sec_4' },
      { type: QuestionType.LOCATION, label: 'Ubicación y Barrio', name: 'ubicacion_mapa', required: true, order: 41 },
      { type: QuestionType.SECTION_HEADER, label: '5. Descripción', order: 50, name: 'sec_5' },
      { type: QuestionType.TEXTAREA, label: 'Descripción general', name: 'descripcion_general', required: true, order: 51 },
      { type: QuestionType.SECTION_HEADER, label: '6. Evidencia Fotográfica', order: 60, name: 'sec_6' },
      { type: QuestionType.FILE, label: 'Fotos de Evidencia', name: 'fotos_evidencia', order: 61 },
      { type: QuestionType.SECTION_HEADER, label: '7. Entidades', order: 70, name: 'sec_7' },
      { type: QuestionType.ENTITY_SELECT, label: 'Entidad responsable', name: 'entidad_responsable', order: 71 },
      { type: QuestionType.MULTISELECT, label: 'Entidades acompañantes', name: 'entidades_acompanantes', options: JSON.stringify([
        { label: 'UAESP', value: 'uaesp' },
        { label: 'Promoambiental', value: 'promoambiental' },
        { label: 'IVC', value: 'ivc' },
        { label: 'Alcaldía Local', value: 'alcaldia' },
        { label: 'Policía Nacional', value: 'policia' },
        { label: 'Ejército Nacional', value: 'ejercito' },
        { label: 'Secretaría de Gobierno', value: 'gobierno' },
        { label: 'Secretaría de Seguridad', value: 'seguridad' }
      ]), order: 72 },
      { type: QuestionType.SECTION_HEADER, label: '8. Operativo en Grupo', order: 80, name: 'sec_8' },
      { type: QuestionType.CHECKBOX, label: '¿Este operativo fue realizado en grupo?', name: 'en_grupo', order: 81 },
      { type: QuestionType.SECTION_HEADER, label: '9. Acta del Operativo', order: 90, name: 'sec_9' },
      { type: QuestionType.FILE, label: 'Acta del Operativo (PDF)', name: 'acta_pdf', order: 91 },
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
