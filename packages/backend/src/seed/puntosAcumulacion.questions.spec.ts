import { buildPuntosAcumulacionQuestions } from './puntosAcumulacion.questions';
import { QuestionType } from '../questions/question.entity';

const ent = [{ label: 'UAESP', value: 'UAESP' }];
const byName = (qs: any[]) => Object.fromEntries(qs.map((q) => [q.name, q]));

describe('buildPuntosAcumulacionQuestions', () => {
  it('renombra la sección de datos a "Datos del punto"', () => {
    const sec = buildPuntosAcumulacionQuestions(ent).find((q) => q.name === 'sec_2');
    expect(sec?.label).toBe('2. Datos del punto');
  });

  it('agrega frecuenciaAcumulacion como RADIO con 4 opciones', () => {
    const q = byName(buildPuntosAcumulacionQuestions(ent)).frecuenciaAcumulacion;
    expect(q.type).toBe(QuestionType.RADIO);
    expect((q.options as any[]).map((o) => o.value)).toEqual([
      'PRIMERA_VEZ', 'OCASIONAL', 'FRECUENTE', 'PERMANENTE',
    ]);
  });

  it('reemplaza quienDispuso por el bloque de identificación del generador', () => {
    const qs = byName(buildPuntosAcumulacionQuestions(ent));
    expect(qs.quienDispuso).toBeUndefined();
    expect(qs.identificacionGenerador.type).toBe(QuestionType.RADIO);
    expect(qs.identificacionGenerador.required).toBe(true);
    expect((qs.identificacionGenerador.options as any[]).map((o) => o.value)).toEqual([
      'SI', 'NO', 'PARCIALMENTE',
    ]);
  });

  it('tipoGenerador/nombre/direccion son condicionales a identificacion != NO', () => {
    const qs = byName(buildPuntosAcumulacionQuestions(ent));
    for (const name of ['tipoGenerador', 'nombreResponsable', 'direccionResponsable']) {
      expect(qs[name].config.visibleIf).toEqual({
        name: 'identificacionGenerador', valueIn: ['SI', 'PARCIALMENTE'],
      });
    }
  });

  it('incluye observoDisposicion, fechaObservacion y metodoIdentificacion', () => {
    const qs = byName(buildPuntosAcumulacionQuestions(ent));
    expect(qs.observoDisposicion.type).toBe(QuestionType.RADIO);
    expect(qs.fechaObservacion.type).toBe(QuestionType.DATE);
    expect((qs.metodoIdentificacion.options as any[]).length).toBe(7);
  });

  it('actoresEstrategicos es MULTISELECT con 6 opciones y hay telefonoActor', () => {
    const qs = byName(buildPuntosAcumulacionQuestions(ent));
    expect(qs.actoresEstrategicos.type).toBe(QuestionType.MULTISELECT);
    expect((qs.actoresEstrategicos.options as any[]).map((o) => o.value)).toEqual([
      'JAC', 'ADMINISTRADOR_SECTOR', 'COMERCIANTE', 'EMPRESA', 'ALCALDIA_LOCAL', 'OTRO',
    ]);
    expect(qs.telefonoActor.type).toBe(QuestionType.TEXT);
  });

  it('agrega intervencionesRecomendadas MULTISELECT con 11 opciones', () => {
    const q = byName(buildPuntosAcumulacionQuestions(ent)).intervencionesRecomendadas;
    expect(q.type).toBe(QuestionType.MULTISELECT);
    expect((q.options as any[]).length).toBe(11);
  });

  it('conserva las preguntas de residuo, fecha, ubicación, evidencia y entidades', () => {
    const qs = byName(buildPuntosAcumulacionQuestions(ent));
    for (const name of ['tipoResiduo', 'percibeOlores', 'areaLinealMetros',
      'fecha_operativo', 'ubicacion_mapa', 'fotos_evidencia', 'entidad_responsable']) {
      expect(qs[name]).toBeDefined();
    }
  });
});
