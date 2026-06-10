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
    const catAmbiental = await this.categoriesRepo.save(
      this.categoriesRepo.create({ name: 'AMBIENTAL', description: 'Gestión Ambiental' }),
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
      { name: 'estructurasNoConvencionales',       type: QuestionType.NUMBER, label: 'Estructuras no convencionales intervenidas',         isMetric: true, order: 10 },
      { name: 'cambuches',                         type: QuestionType.NUMBER, label: 'Cambuches intervenidos',                            isMetric: true, order: 11 },
      { name: 'cachivacherosIntervenidos',         type: QuestionType.NUMBER, label: 'Cachivacheros intervenidos',                        isMetric: true, order: 12 },
      { name: 'comparendos',                       type: QuestionType.NUMBER, label: 'Comparendos impuestos',                             isMetric: true, order: 13 },
      { name: 'armasCortopunzantes',               type: QuestionType.NUMBER, label: 'Armas cortopunzantes incautadas',                   isMetric: true, order: 14 },
      { name: 'armasFuego',                        type: QuestionType.NUMBER, label: 'Armas de fuego incautadas',                         isMetric: true, order: 15 },
      { name: 'mendicidad',                        type: QuestionType.NUMBER, label: 'Personas en situación de mendicidad identificadas',  isMetric: true, order: 16 },
      { name: 'trasladadosCtp',                    type: QuestionType.NUMBER, label: 'Trasladados a CTP',                                 isMetric: true, order: 17 },
      { name: 'capturados',                        type: QuestionType.NUMBER, label: 'Capturados',                                        isMetric: true, order: 18 },
      { name: 'personasSensibilizadas',            type: QuestionType.NUMBER, label: 'Personas sensibilizadas',                           isMetric: true, order: 19 },
      { name: 'kgMercanciaIncautada',              type: QuestionType.NUMBER, label: 'Kg de mercancía incautada',                         isMetric: true, order: 20 },
      { name: 'pipetasIncautadas',                 type: QuestionType.NUMBER, label: 'Pipetas incautadas',                                isMetric: true, order: 21 },
      { name: 'bicicletasRecuperadas',             type: QuestionType.NUMBER, label: 'Bicicletas recuperadas',                            isMetric: true, order: 22 },
      { name: 'celularesRecuperados',              type: QuestionType.NUMBER, label: 'Celulares recuperados',                             isMetric: true, order: 23 },
      { name: 'carretasIncautadas',                type: QuestionType.NUMBER, label: 'Carretas incautadas',                               isMetric: true, order: 24 },
      { name: 'vendedoresInformalesRetirados',     type: QuestionType.NUMBER, label: 'Vendedores informales retirados',                   isMetric: true, order: 25 },
      { name: 'vendedoresInformalesIntervenidos',  type: QuestionType.NUMBER, label: 'Vendedores informales intervenidos',                isMetric: true, order: 26 },
      { name: 'm2RecuperadosEspacioPublico',       type: QuestionType.NUMBER, label: 'M2 recuperados de espacio público',                 isMetric: true, order: 27 },
    ]);

    // ─── AMBIENTAL: AMBIENTAL ─────────────────────────────────────────────────
    const subAmbiental = await this.subcategoriesRepo.save(
      this.subcategoriesRepo.create({ name: 'Ambiental', categoryId: catAmbiental.id }),
    );
    await this.seedSurvey(subAmbiental.id, 'AMBIENTAL - Ambiental', entidadesOpts, [
      { name: 'puntosCriticosEmergentesAtendidos', type: QuestionType.NUMBER, label: 'Puntos de residuos emergentes atendidos',           isMetric: true, order: 10 },
      { name: 'comparendosPedagogicos',            type: QuestionType.NUMBER, label: 'Comparendos pedagógicos',                          isMetric: true, order: 11 },
      { name: 'comparendos',                       type: QuestionType.NUMBER, label: 'Comparendos',                                      isMetric: true, order: 12 },
      { name: 'personasSensibilizadas',            type: QuestionType.NUMBER, label: 'Personas sensibilizadas',                          isMetric: true, order: 13 },
      { name: 'huertas',                           type: QuestionType.NUMBER, label: 'Huertas',                                         isMetric: true, order: 14 },
      { name: 'kgMaterialResiduosRecolectados',    type: QuestionType.NUMBER, label: 'Kg de material de residuos recolectados',          isMetric: true, order: 15 },
      { name: 'm2RecuperadosEspacioPublico',       type: QuestionType.NUMBER, label: 'M2 recuperados de espacio público',                isMetric: true, order: 16 },
    ]);

    // ─── AMBIENTAL: PUNTOS DE ACUMULACIÓN DE RESIDUOS ────────────────────────
    const subPuntos = await this.subcategoriesRepo.save(
      this.subcategoriesRepo.create({ name: 'Puntos de Acumulación de Residuos', categoryId: catAmbiental.id }),
    );
    await this.seedSurveyPuntosAcumulacion(subPuntos.id, entidadesOpts);

    return { message: 'Seed definitivo ejecutado con éxito', created: 6 };
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

  /**
   * Encuesta especial para Identificación de Puntos de Acumulación de Residuos.
   * Usa campos RADIO con opciones específicas definidas en operativoFields.ts de espacio-publico.
   */
  private async seedSurveyPuntosAcumulacion(
    subcategoryId: string,
    entidadesOpts: { label: string; value: string }[],
  ) {
    const survey = await this.surveysRepo.save(
      this.surveysRepo.create({
        title: 'AMBIENTAL - Identificación de Puntos de Acumulación de Residuos',
        status: SurveyStatus.ACTIVE,
        subcategoryId,
        version: 1,
      }),
    );

    const questions: Partial<Question>[] = [
      // ── SECCIÓN 2: Datos del Punto de Acumulación ────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '2. Datos del Punto de Acumulación', name: 'sec_2', order: 1 },
      {
        type: QuestionType.RADIO,
        label: '¿Quién dispuso los residuos?',
        name: 'quienDispuso',
        required: true,
        order: 10,
        options: [
          { value: 'COMUNIDAD',                   label: 'Comunidad' },
          { value: 'ESTABLECIMIENTOS_COMERCIALES', label: 'Establecimientos comerciales' },
          { value: 'VOLQUETAS',                    label: 'Volquetas' },
          { value: 'HABITANTES_DE_CALLE',          label: 'Habitantes de calle' },
          { value: 'OTROS_NO_SE_CONOCE',           label: 'Otros, no se conoce' },
        ],
      },
      {
        type: QuestionType.RADIO,
        label: '¿Qué tipo de residuo fue dispuesto?',
        name: 'tipoResiduo',
        required: true,
        order: 11,
        options: [
          { value: 'RESIDUOS_ORDINARIOS',  label: 'Residuos ordinarios' },
          { value: 'RESIDUOS_VOLUMINOSOS', label: 'Residuos voluminosos' },
          { value: 'ESCOMBROS',            label: 'Escombros' },
        ],
      },
      {
        type: QuestionType.RADIO,
        label: '¿Se perciben olores?',
        name: 'percibeOlores',
        required: true,
        order: 12,
        options: [
          { value: 'true',  label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
      },
      {
        type: QuestionType.RADIO,
        label: '¿Se perciben vectores? (Roedores, Palomas, Insectos, Perros Callejeros, Gatos Callejeros)',
        name: 'percibeVectores',
        required: true,
        order: 13,
        options: [
          { value: 'true',  label: 'Sí' },
          { value: 'false', label: 'No' },
        ],
      },
      {
        type: QuestionType.NUMBER,
        label: 'Área lineal estimada ocupada por los residuos (metros)',
        name: 'areaLinealMetros',
        required: true,
        placeholder: 'Ej: 10',
        order: 14,
      },
      {
        type: QuestionType.TEXTAREA,
        label: 'Observaciones',
        name: 'observaciones',
        placeholder: 'Observaciones adicionales sobre el punto de acumulación...',
        order: 15,
      },

      // ── SECCIÓN 3: Fecha y Hora ──────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', name: 'sec_3', order: 30 },
      { type: QuestionType.DATE, label: 'Fecha y hora del reporte', name: 'fecha_operativo', required: true, order: 31 },

      // ── SECCIÓN 4: Ubicación ─────────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', name: 'sec_4', order: 40 },
      { type: QuestionType.LOCATION, label: 'Ubicación del punto de acumulación', name: 'ubicacion_mapa', required: true, order: 41 },

      // ── SECCIÓN 5: Evidencia Fotográfica ────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '5. Evidencia Fotográfica', name: 'sec_5', order: 50 },
      {
        type: QuestionType.FILE,
        label: 'Fotos del punto de acumulación',
        name: 'fotos_evidencia',
        required: true,
        config: { maxFiles: 5, maxSizeMB: 10 },
        order: 51,
      },

      // ── SECCIÓN 6: Entidades ─────────────────────────────────────────────────
      { type: QuestionType.SECTION_HEADER, label: '6. Entidades', name: 'sec_6', order: 60 },
      {
        type: QuestionType.SELECT,
        label: 'Entidad responsable',
        name: 'entidad_responsable',
        required: true,
        options: entidadesOpts,
        order: 61,
      },
      {
        type: QuestionType.MULTISELECT,
        label: 'Entidades acompañantes',
        name: 'entidades_acompanantes',
        options: entidadesOpts,
        order: 62,
      },
    ];

    for (const q of questions) {
      await this.questionsRepo.save(
        this.questionsRepo.create({ ...q, surveyId: survey.id }),
      );
    }
  }

  /**
   * Arreglo idempotente y NO destructivo del módulo PYBA. No borra nada.
   * - Fija visibleRoles de la categoría a ['GESTOR_PYBA'].
   * - Activa (ACTIVE) las encuestas PYBA que estén en DRAFT.
   * - Normaliza los nombres técnicos de la encuesta de Urgencias.
   * - Crea la subcategoría/encuesta "Identificacion de canino" si no existe.
   */
  async seedPyba(): Promise<{ message: string; details: string[] }> {
    const details: string[] = [];
    const CAT_NAME = 'Protección y bienestar Animal';

    // 1. Categoría + visibleRoles
    const existingCat = await this.categoriesRepo.findOne({
      where: { name: CAT_NAME },
    });
    let cat: Category;
    if (!existingCat) {
      cat = await this.categoriesRepo.save(
        this.categoriesRepo.create({
          name: CAT_NAME,
          description: 'Bienestar animal',
          visibleRoles: ['GESTOR_PYBA'],
        }),
      );
      details.push('Categoría PYBA creada con visibleRoles=[GESTOR_PYBA]');
    } else {
      (existingCat as any).visibleRoles = ['GESTOR_PYBA'];
      cat = await this.categoriesRepo.save(existingCat);
      details.push('visibleRoles de categoría PYBA = [GESTOR_PYBA]');
    }

    // 2. Activar encuestas existentes de la categoría
    const subs = await this.subcategoriesRepo.find({
      where: { categoryId: cat.id },
    });
    for (const sub of subs) {
      const surveys = await this.surveysRepo.find({
        where: { subcategoryId: sub.id },
      });
      for (const s of surveys) {
        if (s.status !== SurveyStatus.ACTIVE) {
          s.status = SurveyStatus.ACTIVE;
          await this.surveysRepo.save(s);
          details.push(`Encuesta activada: ${s.title}`);
        }
      }
    }

    // 3. Reconstruir canónicamente las 6 encuestas PYBA: secciones con
    //    encabezados, entidad_responsable como SELECT, sin direccion/lugar/horario,
    //    ubicacion_mapa con barrio autodetectado. Borra+inserta las preguntas.
    const E = ['Alcaldía Local de Santa Fé', 'IDPYBA', 'Subred Centro Oriente de Salud'].map((n) => ({ label: n, value: n }));
    const sec = (label: string, name: string, order: number): Partial<Question> => ({ type: QuestionType.SECTION_HEADER, label, name, order });
    const fecha = (order: number, label = 'Fecha'): Partial<Question> => ({ type: QuestionType.DATE, label, name: 'fecha_operativo', required: true, order });
    const ubic = (order: number): Partial<Question> => ({ type: QuestionType.LOCATION, label: 'Ubicación en el mapa (barrio autodetectado)', name: 'ubicacion_mapa', required: true, order });
    const desc = (order: number): Partial<Question> => ({ type: QuestionType.TEXTAREA, label: 'Descripción general', name: 'descripcion_general', required: true, order });
    const foto = (order: number, label = 'Fotos de evidencia'): Partial<Question> => ({ type: QuestionType.FILE, label, name: 'fotos_evidencia', required: true, config: { maxFiles: 5, maxSizeMB: 10 }, order });
    const entResp = (order: number): Partial<Question> => ({ type: QuestionType.SELECT, label: 'Entidad responsable', name: 'entidad_responsable', required: true, options: E, order });
    const acomp = (order: number): Partial<Question> => ({ type: QuestionType.MULTISELECT, label: 'Entidades acompañantes', name: 'entidades_acompanantes', options: E, order });
    const acta = (order: number): Partial<Question> => ({ type: QuestionType.FILE, label: 'Acta de la actividad (PDF)', name: 'acta_pdf', required: true, config: { accept: 'application/pdf', maxSizeMB: 10 }, order });

    const caninoQs: Partial<Question>[] = [
      sec('Hoja de vida del canino', 'sec_canino', 1),
      { type: QuestionType.TEXT, label: 'Nombre del canino', name: 'nombre_canino', order: 2 },
      { type: QuestionType.RADIO, label: 'Sexo', name: 'sexo', order: 3, options: [{ value: 'MACHO', label: 'Macho' }, { value: 'HEMBRA', label: 'Hembra' }] },
      { type: QuestionType.TEXT, label: 'Edad aproximada', name: 'edad_aprox', order: 4 },
      { type: QuestionType.TEXT, label: 'Raza / mestizo', name: 'raza', order: 5 },
      { type: QuestionType.TEXT, label: 'Color', name: 'color', order: 6 },
      { type: QuestionType.RADIO, label: 'Tamaño', name: 'tamano', order: 7, options: [{ value: 'PEQUENO', label: 'Pequeño' }, { value: 'MEDIANO', label: 'Mediano' }, { value: 'GRANDE', label: 'Grande' }] },
      { type: QuestionType.TEXTAREA, label: 'Estado de salud', name: 'estado_salud', order: 8 },
      { type: QuestionType.RADIO, label: '¿Esterilizado?', name: 'esterilizado', order: 9, options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
      { type: QuestionType.TEXTAREA, label: 'Observaciones', name: 'observaciones', order: 10 },
      sec('Fecha', 'sec_fecha', 20), fecha(21, 'Fecha de identificación'),
      sec('Ubicación', 'sec_ubic', 30), ubic(31),
      sec('Evidencia fotográfica', 'sec_foto', 40), foto(41, 'Foto del canino'),
      sec('Entidades', 'sec_ent', 50), entResp(51), acomp(52),
    ];

    const esterilizacionQs: Partial<Question>[] = [
      sec('Fecha', 'sec_fecha', 10), fecha(11),
      sec('Ubicación', 'sec_ubic', 20), ubic(21),
      sec('Evidencia fotográfica', 'sec_foto', 30), foto(31),
      sec('Resultados', 'sec_res', 40),
      { type: QuestionType.NUMBER, label: 'Caninos esterilizados', name: 'caninos_esterilizados', order: 41 },
      { type: QuestionType.NUMBER, label: 'Felinos esterilizados', name: 'felinos_esterilizados', order: 42 },
      sec('Entidades', 'sec_ent', 50), entResp(51), acomp(52),
    ];

    const brigadaQs: Partial<Question>[] = [
      sec('Fecha', 'sec_fecha', 10), fecha(11),
      sec('Ubicación', 'sec_ubic', 20), ubic(21),
      sec('Descripción', 'sec_desc', 30), desc(31),
      sec('Evidencia fotográfica', 'sec_foto', 40), foto(41),
      sec('Resultados', 'sec_res', 50),
      { type: QuestionType.NUMBER, label: 'Caninos atendidos', name: 'caninos_atendidos', order: 51 },
      { type: QuestionType.NUMBER, label: 'Felinos atendidos', name: 'felinos_atendidos', order: 52 },
      sec('Entidades', 'sec_ent', 60), entResp(61), acomp(62),
      sec('Acta', 'sec_acta', 70), acta(71),
    ];

    const sensibilizacionQs: Partial<Question>[] = [
      sec('Fecha', 'sec_fecha', 10), fecha(11),
      sec('Ubicación', 'sec_ubic', 20), ubic(21),
      sec('Descripción', 'sec_desc', 30), desc(31),
      sec('Evidencia fotográfica', 'sec_foto', 40), foto(41),
      sec('Resultados', 'sec_res', 50),
      { type: QuestionType.TEXTAREA, label: 'Resultados de la actividad', name: 'resultados_actividad', order: 51 },
      sec('Entidades', 'sec_ent', 60), entResp(61), acomp(62),
      sec('Acta', 'sec_acta', 70), acta(71),
    ];

    const adopcionQs: Partial<Question>[] = [
      sec('Fecha', 'sec_fecha', 10), fecha(11),
      sec('Ubicación', 'sec_ubic', 20), ubic(21),
      sec('Descripción', 'sec_desc', 30), desc(31),
      sec('Evidencia fotográfica', 'sec_foto', 40), foto(41),
      sec('Resultados', 'sec_res', 50),
      { type: QuestionType.TEXTAREA, label: 'Resultados de la actividad', name: 'resultados_actividad', order: 51 },
      sec('Entidades', 'sec_ent', 60), entResp(61), acomp(62),
    ];

    const urgenciasQs: Partial<Question>[] = [
      sec('Datos del caso', 'sec_caso', 10),
      { type: QuestionType.DATE, label: 'Fecha de reporte', name: 'fecha_operativo', required: true, order: 11 },
      { type: QuestionType.TEXTAREA, label: 'Descripción del caso', name: 'descripcion_general', required: true, order: 12 },
      { type: QuestionType.DATE, label: 'Fecha de atención', name: 'fecha_atencion', order: 13 },
      sec('Ubicación', 'sec_ubic', 20), ubic(21),
      sec('Evidencia fotográfica', 'sec_foto', 30), foto(31),
      sec('Entidades', 'sec_ent', 40), entResp(41),
    ];

    const SURVEYS: { name: string; title: string; questions: Partial<Question>[] }[] = [
      { name: 'Identificacion de canino', title: 'PYBA - Identificación / Hoja de vida canino', questions: caninoQs },
      { name: 'Jornada de esterilizacion Canina y Felina', title: 'PYBA - Jornada de esterilización canina y felina', questions: esterilizacionQs },
      { name: 'Brigada medico veterinaria', title: 'PYBA - Brigada médico veterinaria', questions: brigadaQs },
      { name: 'Jornada de sensibilizacion en tenencia responsable de animales de compania', title: 'PYBA - Jornada de sensibilización', questions: sensibilizacionQs },
      { name: 'Jornada de adopcion canina y felina', title: 'PYBA - Jornada de adopción canina y felina', questions: adopcionQs },
      { name: 'Urgencias Veterinarias', title: 'PYBA - Urgencias veterinarias', questions: urgenciasQs },
    ];

    for (const def of SURVEYS) {
      let sub = subs.find((x) => x.name === def.name);
      if (!sub) {
        sub = await this.subcategoriesRepo.save(this.subcategoriesRepo.create({ name: def.name, categoryId: cat.id }));
        details.push(`Subcategoría creada: ${def.name}`);
      }
      let survey = await this.surveysRepo.findOne({ where: { subcategoryId: sub.id } });
      if (!survey) {
        survey = await this.surveysRepo.save(this.surveysRepo.create({ title: def.title, status: SurveyStatus.ACTIVE, subcategoryId: sub.id, version: 1 }));
      } else {
        survey.title = def.title;
        survey.status = SurveyStatus.ACTIVE;
        await this.surveysRepo.save(survey);
      }
      await this.questionsRepo.delete({ surveyId: survey.id });
      for (const q of def.questions) {
        await this.questionsRepo.save(this.questionsRepo.create({ ...q, surveyId: survey.id }));
      }
      details.push(`Encuesta reconstruida: ${def.title} (${def.questions.length} preguntas)`);
    }

    return { message: 'Seed PYBA ejecutado', details };
  }
}
