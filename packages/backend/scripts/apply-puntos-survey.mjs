// Runbook: aplica los cambios de la encuesta de Puntos de Acumulacion contra la encuesta VIVA en prod.
// Dry-run por defecto (imprime el plan, no ejecuta nada). Usar --apply para ejecutar.
//
// Uso:
//   SURVEYS_API_URL=https://<encuestas-backend>.up.railway.app node packages/backend/scripts/apply-puntos-survey.mjs
//   SURVEYS_API_URL=https://<encuestas-backend>.up.railway.app node packages/backend/scripts/apply-puntos-survey.mjs --apply

const BASE = process.env.SURVEYS_API_URL;
const SURVEY_ID = '65045573-d85b-48fe-aae0-2d8692c1b1e9';
const APPLY = process.argv.includes('--apply');

if (!BASE) {
  console.error('Falta SURVEYS_API_URL');
  process.exit(1);
}

// Preguntas nuevas del bloque generador/actores/intervenciones.
// Copiado EXACTO desde packages/backend/src/seed/puntosAcumulacion.questions.ts
// (mismos name/type/label/options/config/order).
const NUEVAS = [
  {
    type: 'RADIO', label: 'Frecuencia de acumulación', name: 'frecuenciaAcumulacion', order: 5,
    options: [
      { value: 'PRIMERA_VEZ', label: 'Primera vez' },
      { value: 'OCASIONAL', label: 'Ocasional' },
      { value: 'FRECUENTE', label: 'Frecuente' },
      { value: 'PERMANENTE', label: 'Permanente' },
    ],
  },
  {
    type: 'SECTION_HEADER', label: 'Identificación del presunto generador', name: 'sec_generador', order: 24,
  },
  {
    type: 'RADIO', label: '¿Se logró identificar quién dispone los residuos?',
    name: 'identificacionGenerador', required: true, order: 25,
    options: [
      { value: 'SI', label: 'Sí' }, { value: 'NO', label: 'No' }, { value: 'PARCIALMENTE', label: 'Parcialmente' },
    ],
  },
  {
    type: 'RADIO', label: 'Tipo de generador', name: 'tipoGenerador', order: 26,
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
  {
    type: 'TEXT', label: 'Nombre del establecimiento o responsable', name: 'nombreResponsable', order: 27,
    config: { visibleIf: { name: 'identificacionGenerador', valueIn: ['SI', 'PARCIALMENTE'] } },
  },
  {
    type: 'TEXT', label: 'Dirección del establecimiento o responsable', name: 'direccionResponsable', order: 28,
    config: { visibleIf: { name: 'identificacionGenerador', valueIn: ['SI', 'PARCIALMENTE'] } },
  },
  {
    type: 'RADIO', label: '¿Se observó directamente la disposición de residuos?', name: 'observoDisposicion', order: 29,
    options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }],
  },
  {
    type: 'DATE', label: 'Fecha y hora en que se observó la disposición', name: 'fechaObservacion', order: 30,
  },
  {
    type: 'RADIO', label: '¿Cómo se identificó al presunto responsable?', name: 'metodoIdentificacion', order: 31,
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
  {
    type: 'TEXT', label: 'Teléfono del actor', name: 'telefonoActor', placeholder: 'Ej: 3001234567', order: 33,
  },
  {
    type: 'MULTISELECT', label: 'Intervenciones recomendadas', name: 'intervencionesRecomendadas', order: 34,
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
];

const j = async (r) => {
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
};

async function computePlan(survey, nuevas) {
  const byName = Object.fromEntries(survey.questions.map((q) => [q.name, q]));
  const plan = [];

  if (byName.sec_2 && byName.sec_2.label !== '2. Datos del punto') {
    plan.push({ verb: 'PATCH', id: byName.sec_2.id, name: 'sec_2', body: { label: '2. Datos del punto' } });
  }

  if (byName.actoresEstrategicos) {
    plan.push({
      verb: 'PATCH',
      id: byName.actoresEstrategicos.id,
      name: 'actoresEstrategicos',
      body: {
        type: 'MULTISELECT',
        options: [
          { value: 'JAC', label: 'Junta de Acción Comunal' },
          { value: 'ADMINISTRADOR_SECTOR', label: 'Administrador del sector' },
          { value: 'COMERCIANTE', label: 'Comerciante' },
          { value: 'EMPRESA', label: 'Empresa' },
          { value: 'ALCALDIA_LOCAL', label: 'Alcaldía Local' },
          { value: 'OTRO', label: 'Otro' },
        ],
      },
    });
  }

  for (const q of nuevas) {
    if (!byName[q.name]) plan.push({ verb: 'POST', name: q.name, body: q });
  }

  if (byName.quienDispuso) {
    plan.push({ verb: 'DELETE', id: byName.quienDispuso.id, name: 'quienDispuso' });
  }

  return plan;
}

async function main() {
  const survey = await j(await fetch(`${BASE}/surveys/${SURVEY_ID}`));
  const plan = await computePlan(survey, NUEVAS);

  console.log(`\n=== PLAN (${APPLY ? 'APPLY' : 'DRY-RUN'}) — ${plan.length} acciones ===`);
  for (const a of plan) {
    console.log(`${a.verb.padEnd(6)} ${a.name}`, a.body ? JSON.stringify(a.body).slice(0, 120) : '');
  }

  if (!APPLY) {
    console.log('\nDry-run: nada ejecutado. Re-correr con --apply para aplicar.');
    return;
  }

  for (const a of plan) {
    if (a.verb === 'PATCH') {
      await j(await fetch(`${BASE}/questions/${a.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(a.body),
      }));
    } else if (a.verb === 'POST') {
      await j(await fetch(`${BASE}/surveys/${SURVEY_ID}/questions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(a.body),
      }));
    } else if (a.verb === 'DELETE') {
      await j(await fetch(`${BASE}/questions/${a.id}`, { method: 'DELETE' }));
    }
    console.log(`OK ${a.verb} ${a.name}`);
  }

  console.log('\nAplicado. Verificar en el formulario del gestor.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
