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

    const catIVC = await this.categoriesRepo.save(
      this.categoriesRepo.create({ name: 'IVC', description: 'Inspección, Vigilancia y Control' }),
    );
    const catEP = await this.categoriesRepo.save(
      this.categoriesRepo.create({ name: 'Espacio Público', description: 'Gestión de Espacio Público' }),
    );

    // Lista compartida de entidades acompañantes (igual en todos los formularios)
    const entidadesOpts = [
      'UAESP', 'Promoambiental', 'IVC', 'Alcaldía Local de Santa Fé',
      'Policía Nacional', 'Ejército Nacional', 'Secretaría de Gobierno',
      'Secretaría de Seguridad', 'Inspección de Policía', 'Personería',
      'Defensoría del Pueblo', 'ICBF', 'Fiscalía', 'Tránsito', 'Bomberos',
      'Cruz Roja', 'Defensa Civil', 'Integración Social',
      'Policía de Transito', 'Secretaría de Movilidad',
    ].map(name => ({ label: name, value: name }));

    // ─── IVC: ESTABLECIMIENTOS DE COMERCIO ────────────────────────────────────
    const subEst = await this.subcategoriesRepo.save(
      this.subcategoriesRepo.create({ name: 'Establecimientos de comercio', categoryId: catIVC.id }),
    );
    await this.seedSurvey(subEst.id, 'IVC - Establecimientos de Comercio', entidadesOpts, [
      { name: 'establecimientosVisitados',         type: QuestionType.NUMBER,   label: 'Establecimientos visitados',                         isMetric: true,  order: 10 },
      { name: 'sellamientos',                      type: QuestionType.CHECKBOX, label: 'Establecimientos sellados',                          isMetric: true,  order: 11 },
      { name: 'incautaciones',                     type: QuestionType.NUMBER,   label: 'Incautaciones',                                      isMetric: true,  order: 12 },
      { name: 'licoresAdulterados',                type: QuestionType.NUMBER,   label: 'Licores adulterados incautados',                     isMetric: true,  order: 13 },
      { name: 'armasCortopunzantes',               type: QuestionType.NUMBER,   label: 'Armas cortopunzantes incautadas',                    isMetric: true,  order: 14 },
      { name: 'armasFuegoMunicionTraumaticas',     type: QuestionType.NUMBER,   label: 'Armas de fuego / munición / traumáticas incautadas', isMetric: true,  order: 15 },
      { name: 'personasSensibilizadas',            type: QuestionType.NUMBER,   label: 'Personas sensibilizadas',                           isMetric: true,  order: 16 },
      { name: 'menoresEdad',                       type: QuestionType.NUMBER,   label: 'Menores de edad',                                   isMetric: true,  order: 17 },
      { name: 'kgAproximadoPolvora',               type: QuestionType.NUMBER,   label: 'Kg aproximados de pólvora incautados',               isMetric: true,  order: 18 },
      { name: 'gramosSpa',                         type: QuestionType.NUMBER,   label: 'Gramos de SPA incautados',                          isMetric: true,  order: 19 },
      { name: 'personasTrasladadasCtp',            type: QuestionType.NUMBER,   label: 'Personas trasladadas a CTP',                        isMetric: true,  order: 20 },
      { name: 'personasCapturadas',                type: QuestionType.NUMBER,   label: 'Personas capturadas',                               isMetric: true,  order: 21 },
      { name: 'vendedoresInformalesRetirados',     type: QuestionType.NUMBER,   label: 'Vendedores informales retirados',                    isMetric: true,  order: 22 },
      { name: 'vendedoresInformalesIntervenidos',  type: QuestionType.NUMBER,   label: 'Vendedores informales intervenidos',                 isMetric: true,  order: 23 },
    ]);

    // ─── IVC: PAGADIARIOS ─────────────────────────────────────────────────────
    const subPag = await this.subcategoriesRepo.save(
      this.subcategoriesRepo.create({ name: 'Pagadiarios', categoryId: catIVC.id }),
    );
    await this.seedSurvey(subPag.id, 'IVC - Pagadiarios', entidadesOpts, [
      { name: 'establecimientosVisitados',         type: QuestionType.NUMBER,   label: 'Establecimientos visitados',                         isMetric: true,  order: 10 },
      { name: 'sellamientos',                      type: QuestionType.CHECKBOX, label: 'Establecimientos sellados',                          isMetric: true,  order: 11 },
      { name: 'incautaciones',                     type: QuestionType.NUMBER,   label: 'Incautaciones',                                      isMetric: true,  order: 12 },
      { name: 'armasCortopunzantes',               type: QuestionType.NUMBER,   label: 'Armas cortopunzantes incautadas',                    isMetric: true,  order: 13 },
      { name: 'armasFuegoMunicionTraumaticas',     type: QuestionType.NUMBER,   label: 'Armas de fuego / munición / traumáticas incautadas', isMetric: true,  order: 14 },
      { name: 'personasSensibilizadas',            type: QuestionType.NUMBER,   label: 'Personas sensibilizadas',                           isMetric: true,  order: 15 },
      { name: 'menoresEdad',                       type: QuestionType.NUMBER,   label: 'Menores de edad',                                   isMetric: true,  order: 16 },
      { name: 'kgAproximadoPolvora',               type: QuestionType.NUMBER,   label: 'Kg aproximados de pólvora incautados',               isMetric: true,  order: 17 },
      { name: 'gramosSpa',                         type: QuestionType.NUMBER,   label: 'Gramos de SPA incautados',                          isMetric: true,  order: 18 },
      { name: 'personasTrasladadasCtp',            type: QuestionType.NUMBER,   label: 'Personas trasladadas a CTP',                        isMetric: true,  order: 19 },
      { name: 'personasCapturadas',                type: QuestionType.NUMBER,   label: 'Personas capturadas',                               isMetric: true,  order: 20 },
      { name: 'vendedoresInformalesRetirados',     type: QuestionType.NUMBER,   label: 'Vendedores informales retirados',                    isMetric: true,  order: 21 },
      { name: 'vendedoresInformalesIntervenidos',  type: QuestionType.NUMBER,   label: 'Vendedores informales intervenidos',                 isMetric: true,  order: 22 },
    ]);

    // ─── IVC: PARQUEADEROS ────────────────────────────────────────────────────
    const subPar = await this.subcategoriesRepo.save(
      this.subcategoriesRepo.create({ name: 'Parqueaderos', categoryId: catIVC.id }),
    );
    await this.seedSurvey(subPar.id, 'IVC - Parqueaderos', entidadesOpts, [
      { name: 'sellamientos',        type: QuestionType.CHECKBOX, label: 'Establecimientos sellados', isMetric: true, order: 10 },
      { name: 'vehiculosReceptados', type: QuestionType.NUMBER,   label: 'Vehículos receptados',      isMetric: true, order: 11 },
    ]);

    // ─── ESPACIO PÚBLICO: 1801 ────────────────────────────────────────────────
    const sub1801 = await this.subcategoriesRepo.save(
      this.subcategoriesRepo.create({ name: '1801', categoryId: catEP.id }),
    );
    await this.seedSurvey(sub1801.id, 'Espacio Público - 1801', entidadesOpts, [
      { name: 'estructurasNoConvencionales',       type: QuestionType.NUMBER, label: 'Estructuras no convencionales intervenidas',        isMetric: true, order: 10 },
      { name: 'cambuches',                         type: QuestionType.NUMBER, label: 'Cambuches intervenidos',                           isMetric: true, order: 11 },
      { name: 'cachivacheros',                     type: QuestionType.NUMBER, label: 'Cachivacheros intervenidos',                       isMetric: true, order: 12 },
      { name: 'comparendos',                       type: QuestionType.NUMBER, label: 'Comparendos impuestos',                            isMetric: true, order: 13 },
      { name: 'armasCortopunzantes',               type: QuestionType.NUMBER, label: 'Armas cortopunzantes incautadas',                  isMetric: true, order: 14 },
      { name: 'armasFuego',                        type: QuestionType.NUMBER, label: 'Armas de Fuego Incautadas',                        isMetric: true, order: 15 },
      { name: 'mendicidad',                        type: QuestionType.NUMBER, label: 'Personas en situación de mendicidad identificadas', isMetric: true, order: 16 },
      { name: 'trasladadosCtp',                    type: QuestionType.NUMBER, label: 'Trasladados a CTP',                                isMetric: true, order: 17 },
      { name: 'capturados',                        type: QuestionType.NUMBER, label: 'Capturados',                                       isMetric: true, order: 18 },
      { name: 'personasSensibilizadas',            type: QuestionType.NUMBER, label: 'Personas sensibilizadas',                          isMetric: true, order: 19 },
      { name: 'kgMercancia',                       type: QuestionType.NUMBER, label: 'Kg de mercancía incautada',                        isMetric: true, order: 20 },
      { name: 'pipetas',                           type: QuestionType.NUMBER, label: 'Pipetas incautadas',                               isMetric: true, order: 21 },
      { name: 'bicicletas',                        type: QuestionType.NUMBER, label: 'Bicicletas recuperadas',                           isMetric: true, order: 22 },
      { name: 'celulares',                         type: QuestionType.NUMBER, label: 'Celulares recuperados',                            isMetric: true, order: 23 },
      { name: 'carretas',                          type: QuestionType.NUMBER, label: 'Carretas incautadas',                              isMetric: true, order: 24 },
      { name: 'vendedoresInformalesRetirados',     type: QuestionType.NUMBER, label: 'Vendedores informales retirados',                  isMetric: true, order: 25 },
      { name: 'vendedoresInformalesIntervenidos',  type: QuestionType.NUMBER, label: 'Vendedores informales intervenidos',               isMetric: true, order: 26 },
      { name: 'm2Recuperados',                     type: QuestionType.NUMBER, label: 'M2 recuperados de espacio público',                isMetric: true, order: 27 },
    ]);

    return { message: 'Seed definitivo ejecutado con éxito', created: 4 };
  }

  /**
   * Crea una encuesta con la estructura común de secciones 3-9
   * más los campos específicos de la Sección 2.
   */
  private async seedSurvey(
    subcategoryId: string,
    title: string,
    entidadesOpts: { label: string; value: string }[],
    seccion2Fields: any[],
  ) {
    const survey = await this.surveysRepo.save(
      this.surveysRepo.create({ title, status: SurveyStatus.ACTIVE, subcategoryId, version: 1 }),
    );

    const questions: Partial<Question>[] = [
      // ── SECCIÓN 2: Datos del Operativo ──────────────────────────────────────
      {
        type: QuestionType.SECTION_HEADER,
        label: '2. Datos del Operativo',
        name: 'sec_2',
        order: 1,
      },
      ...seccion2Fields,

      // ── SECCIÓN 3: Fecha y Hora ──────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', name: 'sec_3', order: 30 },
      { type: QuestionType.DATE,           label: 'Fecha y hora del operativo', name: 'fecha_operativo', required: true, order: 31 },

      // ── SECCIÓN 4: Ubicación ─────────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', name: 'sec_4', order: 40 },
      { type: QuestionType.LOCATION,       label: 'Ubicación y Barrio', name: 'ubicacion_mapa', required: true, order: 41 },

      // ── SECCIÓN 5: Descripción ───────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '5. Descripción', name: 'sec_5', order: 50 },
      { type: QuestionType.TEXTAREA,       label: 'Descripción general', name: 'descripcion_general', required: true, placeholder: 'Describe brevemente los resultados y observaciones del operativo...', order: 51 },

      // ── SECCIÓN 6: Evidencia Fotográfica ────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '6. Evidencia Fotográfica', name: 'sec_6', order: 60 },
      {
        type: QuestionType.FILE,
        label: 'Fotos de Evidencia',
        name: 'fotos_evidencia',
        required: true,
        config: { maxFiles: 5, maxSizeMB: 10 },
        order: 61,
      },

      // ── SECCIÓN 7: Entidades ─────────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '7. Entidades', name: 'sec_7', order: 70 },
      {
        type: QuestionType.SELECT,
        label: 'Entidad responsable',
        name: 'entidad_responsable',
        required: true,
        options: entidadesOpts,
        order: 71,
      },
      {
        type: QuestionType.MULTISELECT,
        label: 'Entidades acompañantes',
        name: 'entidades_acompanantes',
        options: entidadesOpts,
        order: 72,
      },

      // ── SECCIÓN 8: Operativo en Grupo ────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '8. Operativo en Grupo', name: 'sec_8', order: 80 },
      {
        type: QuestionType.CHECKBOX,
        label: '¿Este operativo fue realizado en grupo con otros gestores?',
        name: 'en_grupo',
        order: 81,
      },
      {
        // Este campo lo llena el componente de Espacio Público desde su propia
        // base de datos de usuarios. Solo señalamos el "hueco" para que el
        // renderer lo detecte por el nombre técnico "gestores_acompanantes".
        type: QuestionType.ENTITY_SELECT,
        label: 'Gestores acompañantes',
        name: 'gestores_acompanantes',
        config: {
          entityType: 'GESTORES',
          multiple: true,
          visibleIf: { name: 'en_grupo', value: true },
        },
        order: 82,
      },

      // ── SECCIÓN 9: Acta del Operativo ────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '9. Acta del Operativo', name: 'sec_9', order: 90 },
      {
        type: QuestionType.FILE,
        label: 'Acta del Operativo (PDF)',
        name: 'acta_pdf',
        required: true,
        config: { accept: 'application/pdf', minPages: 3, maxSizeMB: 10 },
        order: 91,
      },
    ];

    for (const q of questions) {
      await this.questionsRepo.save(
        this.questionsRepo.create({ ...q, surveyId: survey.id }),
      );
    }
  }
}
