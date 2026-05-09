import type { Survey, CreateSurveyPayload, UpdateSurveyPayload } from '../types';

const BASE_URL = 'https://backendencuestas-production-d973.up.railway.app';

export const surveysApi = {
  getAll: async (subcategoryId?: string): Promise<Survey[]> => {
    const url = subcategoryId
      ? `${BASE_URL}/surveys?subcategoryId=${subcategoryId}`
      : `${BASE_URL}/surveys`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error cargando encuestas');
    return res.json();
  },

  getOne: async (id: string): Promise<Survey> => {
    const res = await fetch(`${BASE_URL}/surveys/${id}`);
    if (!res.ok) throw new Error(`Error cargando encuesta ${id}`);
    return res.json();
  },

  create: async (payload: CreateSurveyPayload): Promise<Survey> => {
    const res = await fetch(`${BASE_URL}/surveys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error creando encuesta');
    return res.json();
  },

  update: async (id: string, payload: UpdateSurveyPayload): Promise<Survey> => {
    const res = await fetch(`${BASE_URL}/surveys/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error actualizando encuesta');
    return res.json();
  },

  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/surveys/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error eliminando encuesta');
  },
};
