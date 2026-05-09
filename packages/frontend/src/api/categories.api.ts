import type { Category } from '../types';

const BASE_URL = 'https://backendencuestas-production-d973.up.railway.app';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Error cargando categorías');
    return res.json();
  },

  getOne: async (id: string): Promise<Category> => {
    const res = await fetch(`${BASE_URL}/categories/${id}`);
    if (!res.ok) throw new Error(`Error cargando categoría ${id}`);
    return res.json();
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error creando categoría');
    return res.json();
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error actualizando categoría');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error eliminando categoría');
  },
};
