import { Question, QuestionType } from '../questions/question.entity';

export function buildPuntosAcumulacionQuestions(
  entidadesOpts: { label: string; value: string }[],
): Partial<Question>[] {
  return [
    { type: QuestionType.SECTION_HEADER, label: '2. Datos del punto', name: 'sec_2', order: 1 },

    // Frecuencia de acumulación (nueva)
    {
      type: QuestionType.RADIO, label: 'Frecuencia de acumulación',
      name: 'frecuenciaAcumulacion', order: 5,
      options: [
        { value: 'PRIMERA_VEZ', label: 'Primera vez' },
        { value: 'OCASIONAL', label: 'Ocasional' },
        { value: 'FRECUENTE', label: 'Frecuente' },
        { value: 'PERMANENTE', label: 'Permanente' },
      ],
    },

    // (quienDispuso ELIMINADA — reemplazada por el bloque generador de abajo)
    {
      type: QuestionType.RADIO, label: '¿Qué tipo de residuo fue dispuesto?',
      name: 'tipoResiduo', required: true, order: 11,
      options: [
        { value: 'RESIDUOS_ORDINARIOS', label: 'Residuos ordinarios' },
        { value: 'RESIDUOS_VOLUMINOSOS', label: 'Residuos voluminosos' },
        { value: 'ESCOMBROS', label: 'Escombros' },
      ],
    },
    { type: QuestionType.RADIO, label: '¿Se perciben olores?', name: 'percibeOlores', required: true, order: 12,
      options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
    { type: QuestionType.RADIO, label: '¿Se perciben vectores? (Roedores, Palomas, Insectos, Perros Callejeros, Gatos Callejeros)', name: 'percibeVectores', required: true, order: 13,
      options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
    { type: QuestionType.NUMBER, label: 'Área lineal estimada ocupada por los residuos (metros)', name: 'areaLinealMetros', required: true, placeholder: 'Ej: 10', order: 14 },
    { type: QuestionType.TEXTAREA, label: 'Observaciones', name: 'observaciones', placeholder: 'Observaciones adicionales sobre el punto de acumulación...', order: 15 },

    // Caracterización del punto (existentes, sin cambios de name)
    { type: QuestionType.RADIO, label: '¿Es un entorno escolar y/o universitario?', name: 'entornoEscolar', order: 16,
      options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
    { type: QuestionType.TEXT, label: 'Nombre del colegio / universidad', name: 'nombreEntornoEscolar', placeholder: 'Nombre de la institución', order: 17,
      config: { visibleIf: { name: 'entornoEscolar', value: 'true' } } },
    { type: QuestionType.RADIO, label: 'Tipo de zona', name: 'tipoZona', order: 18,
      options: [
        { value: 'RESIDENCIAL', label: 'Residencial' }, { value: 'COMERCIAL', label: 'Comercial' },
        { value: 'INDUSTRIAL', label: 'Industrial' }, { value: 'MIXTA', label: 'Mixta' }, { value: 'OTRA', label: 'Otra' },
      ] },
    { type: QuestionType.RADIO, label: 'Tipo de suelo', name: 'tipoSuelo', order: 19,
      options: [
        { value: 'ANDEN', label: 'Andén' }, { value: 'CALLE', label: 'Calle' },
        { value: 'SEPARADOR', label: 'Separador' }, { value: 'PARQUE', label: 'Parque' }, { value: 'OTRO', label: 'Otro' },
      ] },
    { type: QuestionType.MULTISELECT, label: 'Condiciones de la zona', name: 'condicionesZona', order: 20,
      options: [
        { value: 'MAL_ESTADO_VIA', label: 'Mal estado de la vía' }, { value: 'DETERIORO_ANDEN', label: 'Deterioro del andén' },
        { value: 'PRESENCIA_CAMBUCHES', label: 'Presencia de cambuches' }, { value: 'FALTA_ILUMINACION', label: 'Falta de iluminación' },
        { value: 'OTRAS', label: 'Otras' },
      ] },
    { type: QuestionType.RADIO, label: '¿Hay población habitante de calle?', name: 'poblacionHabitanteCalle', order: 21,
      options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
    { type: QuestionType.MULTISELECT, label: 'Factores que propician la acumulación', name: 'factoresAcumulacion', order: 22,
      options: [
        { value: 'CONTENEDOR_MAL_UBICADO', label: 'Contenedor mal ubicado' }, { value: 'CONTENEDOR_DANADO', label: 'Contenedor dañado' },
        { value: 'AUSENCIA_CONTENEDOR', label: 'Ausencia de contenedor' }, { value: 'MAL_USO_CONTENEDOR', label: 'Mal uso del contenedor' },
        { value: 'SIN_ACCESO_RECOLECCION', label: 'Punto sin acceso de recolección' }, { value: 'INCONVENIENTES_SERVICIO', label: 'Inconvenientes con la prestación del servicio' },
        { value: 'OTROS', label: 'Otros' },
      ] },
    { type: QuestionType.RADIO, label: '¿Hay cámaras en el punto? (información del C4)', name: 'camarasPunto', order: 23,
      options: [
        { value: 'NO_HAY', label: 'No hay cámaras' }, { value: 'FUNCIONAMIENTO', label: 'En funcionamiento' },
        { value: 'MANTENIMIENTO', label: 'En mantenimiento' }, { value: 'FUERA_DE_SERVICIO', label: 'Fuera de servicio' },
      ] },

    // ── Identificación del presunto generador (nuevo bloque; reemplaza quienDispuso) ──
    { type: QuestionType.SECTION_HEADER, label: 'Identificación del presunto generador', name: 'sec_generador', order: 24 },
    {
      type: QuestionType.RADIO, label: '¿Se logró identificar quién dispone los residuos?',
      name: 'identificacionGenerador', required: true, order: 25,
      options: [
        { value: 'SI', label: 'Sí' }, { value: 'NO', label: 'No' }, { value: 'PARCIALMENTE', label: 'Parcialmente' },
      ],
    },
    {
      type: QuestionType.RADIO, label: 'Tipo de generador', name: 'tipoGenerador', order: 26,
      config: { visibleIf: { name: 'identificacionGenerador', valueIn: ['SI', 'PARCIALMENTE'] } },
      options: [
        { value: 'COMUNIDAD', label: 'Comunidad' }, { value: 'VIVIENDA', label: 'Vivienda' },
        { value: 'RESTAURANTE', label: 'Restaurante' }, { value: 'BAR', label: 'Bar' },
        { value: 'TIENDA', label: 'Tienda' }, { value: 'SUPERMERCADO', label: 'Supermercado' },
        { value: 'PLAZA_MERCADO', label: 'Plaza de mercado' }, { value: 'OBRA_CONSTRUCCION', label: 'Obra de construcción' },
        { value: 'EMPRESA', label: 'Empresa' }, { value: 'TALLER', label: 'Taller' },
        { value: 'HABITANTE_CALLE', label: 'Habitante de calle' }, { value: 'RECICLADOR', label: 'Reciclador' },
        { value: 'VOLQUETA', label: 'Volqueta' }, { value: 'OTRO', label: 'Otro' },
      ],
    },
    { type: QuestionType.TEXT, label: 'Nombre del establecimiento o responsable', name: 'nombreResponsable', order: 27,
      config: { visibleIf: { name: 'identificacionGenerador', valueIn: ['SI', 'PARCIALMENTE'] } } },
    { type: QuestionType.TEXT, label: 'Dirección del establecimiento o responsable', name: 'direccionResponsable', order: 28,
      config: { visibleIf: { name: 'identificacionGenerador', valueIn: ['SI', 'PARCIALMENTE'] } } },
    { type: QuestionType.RADIO, label: '¿Se observó directamente la disposición de residuos?', name: 'observoDisposicion', order: 29,
      options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
    { type: QuestionType.DATE, label: 'Fecha y hora en que se observó la disposición', name: 'fechaObservacion', order: 30 },
    {
      type: QuestionType.RADIO, label: '¿Cómo se identificó al presunto responsable?', name: 'metodoIdentificacion', order: 31,
      options: [
        { value: 'OBSERVACION_DIRECTA', label: 'Observación directa' },
        { value: 'INFO_COMUNIDAD', label: 'Información de la comunidad' },
        { value: 'CAMARAS', label: 'Cámaras de videovigilancia' },
        { value: 'FOTOGRAFIAS', label: 'Fotografías' },
        { value: 'DOCUMENTACION_RESIDUOS', label: 'Documentación encontrada entre los residuos' },
        { value: 'INFO_OPERADOR_ASEO', label: 'Información del operador de aseo' },
        { value: 'OTRO', label: 'Otro' },
      ],
    },

    // ── Actores estratégicos (ahora checkboxes) + teléfono ──
    {
      type: QuestionType.MULTISELECT, label: 'Actores estratégicos', name: 'actoresEstrategicos', order: 32,
      options: [
        { value: 'JAC', label: 'Junta de Acción Comunal' },
        { value: 'ADMINISTRADOR_SECTOR', label: 'Administrador del sector' },
        { value: 'COMERCIANTE', label: 'Comerciante' },
        { value: 'EMPRESA', label: 'Empresa' },
        { value: 'ALCALDIA_LOCAL', label: 'Alcaldía Local' },
        { value: 'OTRO', label: 'Otro' },
      ],
    },
    { type: QuestionType.TEXT, label: 'Teléfono del actor', name: 'telefonoActor', placeholder: 'Ej: 3001234567', order: 33 },

    // ── Intervenciones recomendadas (nueva) ──
    {
      type: QuestionType.MULTISELECT, label: 'Intervenciones recomendadas', name: 'intervencionesRecomendadas', order: 34,
      options: [
        { value: 'LIMPIEZA_INMEDIATA', label: 'Limpieza inmediata' },
        { value: 'RECOLECCION_ESCOMBROS', label: 'Recolección de escombros' },
        { value: 'INSTALACION_CONTENEDOR', label: 'Instalación de contenedor' },
        { value: 'REUBICACION_CONTENEDOR', label: 'Reubicación de contenedor' },
        { value: 'SENSIBILIZACION', label: 'Sensibilización comunitaria' },
        { value: 'OPERATIVO_POLICIA', label: 'Operativo con Policía' },
        { value: 'COMPARENDO_AMBIENTAL', label: 'Comparendo ambiental' },
        { value: 'SEGUIMIENTO_CAMARAS_C4', label: 'Seguimiento con cámaras del C4' },
        { value: 'CONTROL_ESTABLECIMIENTOS', label: 'Control a establecimientos comerciales' },
        { value: 'CONTROL_OBRAS', label: 'Control a obras de construcción' },
        { value: 'OTRO', label: 'Otro' },
      ],
    },

    // ── Secciones finales (sin cambios) ──
    { type: QuestionType.SECTION_HEADER, label: '3. Fecha y Hora', name: 'sec_3', order: 40 },
    { type: QuestionType.DATE, label: 'Fecha y hora del reporte', name: 'fecha_operativo', required: true, order: 41 },
    { type: QuestionType.SECTION_HEADER, label: '4. Ubicación', name: 'sec_4', order: 50 },
    { type: QuestionType.LOCATION, label: 'Ubicación del punto de acumulación', name: 'ubicacion_mapa', required: true, order: 51 },
    { type: QuestionType.SECTION_HEADER, label: '5. Evidencia Fotográfica', name: 'sec_5', order: 60 },
    { type: QuestionType.FILE, label: 'Fotos del punto de acumulación', name: 'fotos_evidencia', required: true, config: { maxFiles: 5, maxSizeMB: 10 }, order: 61 },
    { type: QuestionType.SECTION_HEADER, label: '6. Entidades', name: 'sec_6', order: 70 },
    { type: QuestionType.SELECT, label: 'Entidad responsable', name: 'entidad_responsable', required: true, options: entidadesOpts, order: 71 },
    { type: QuestionType.MULTISELECT, label: 'Entidades acompañantes', name: 'entidades_acompanantes', options: entidadesOpts, order: 72 },
  ];
}
