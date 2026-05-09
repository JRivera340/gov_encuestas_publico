import type { Subcategory } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const subcategoriesApi = {
  getAll: async (): Promise<Subcategory[]> => {
    const res = await fetch(`${BASE_URL}/subcategories`);
    if (!res.ok) throw new Error('Error cargando subcategorías');
    return res.json();
  },

  getByCategory: async (categoryId: string): Promise<Subcategory[]> => {
    const res = await fetch(`${BASE_URL}/subcategories/by-category/${categoryId}`);
    if (!res.ok) throw new Error('Error cargando subcategorías');
    return res.json();
  },

  getOne: async (id: string): Promise<Subcategory> => {
    const res = await fetch(`${BASE_URL}/subcategories/${id}`);
    if (!res.ok) throw new Error(`Error cargando subcategoría ${id}`);
    return res.json();
  },

  create: async (data: Partial<Subcategory> & { categoryId: string }): Promise<Subcategory> => {
    const res = await fetch(`${BASE_URL}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error creando subcategoría');
    return res.json();
  },

  update: async (id: string, data: Partial<Subcategory>): Promise<Subcategory> => {
    const res = await fetch(`${BASE_URL}/subcategories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error actualizando subcategoría');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/subcategories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error eliminando subcategoría');
  },
};
