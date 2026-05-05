import type { Category } from '../types';

const BASE_URL = 'http://localhost:3000';

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
};
