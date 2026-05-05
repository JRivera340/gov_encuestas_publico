import type { Question, CreateQuestionPayload, UpdateQuestionPayload } from '../types';

const BASE_URL = 'http://localhost:3000';

export const questionsApi = {
  getBySurvey: async (surveyId: string): Promise<Question[]> => {
    const res = await fetch(`${BASE_URL}/surveys/${surveyId}/questions`);
    if (!res.ok) throw new Error('Error cargando preguntas');
    return res.json();
  },

  create: async (surveyId: string, payload: CreateQuestionPayload): Promise<Question> => {
    const res = await fetch(`${BASE_URL}/surveys/${surveyId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error creando pregunta');
    return res.json();
  },

  update: async (id: string, payload: UpdateQuestionPayload): Promise<Question> => {
    const res = await fetch(`${BASE_URL}/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error actualizando pregunta');
    return res.json();
  },

  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error eliminando pregunta');
  },

  reorder: async (surveyId: string, orderedIds: string[]): Promise<void> => {
    const res = await fetch(`${BASE_URL}/surveys/${surveyId}/questions/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) throw new Error('Error reordenando preguntas');
  },
};
