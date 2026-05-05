import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import { surveysApi } from '../api/surveys.api';
import { categoriesApi } from '../api/categories.api';
import type { Category, Subcategory, CreateSurveyPayload } from '../types';
import { SurveyStatus, CATEGORY_DISPLAY_NAMES } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const CreateSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [form, setForm] = useState<CreateSurveyPayload>({
    title: '',
    description: '',
    status: SurveyStatus.DRAFT,
    subcategoryId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {
      toast('Error cargando categorías', 'error');
    });
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCategory);
    setSubcategories(cat?.subcategories ?? []);
    setForm((prev) => ({ ...prev, subcategoryId: '' }));
  }, [selectedCategory, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subcategoryId) {
      toast('Selecciona una subcategoría', 'error');
      return;
    }
    setSaving(true);
    try {
      const survey = await surveysApi.create(form);
      toast('Encuesta creada exitosamente', 'success');
      navigate(`/surveys/${survey.id}/builder`);
    } catch {
      toast('Error creando encuesta', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Header
        title="Nueva encuesta"
        subtitle="Configura la información básica antes de agregar preguntas"
        actions={
          <button onClick={() => navigate('/surveys')} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        }
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Category */}
          <div>
            <label className="label">Categoría *</label>
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {CATEGORY_DISPLAY_NAMES[c.name] ?? c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="label">Subcategoría *</label>
            <select
              className="select"
              value={form.subcategoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, subcategoryId: e.target.value }))}
              disabled={!selectedCategory}
              required
            >
              <option value="">
                {selectedCategory ? 'Seleccionar subcategoría...' : 'Primero selecciona una categoría'}
              </option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <hr className="border-[#30363d]" />

          {/* Title */}
          <div>
            <label className="label">Título del formulario *</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Formulario de Inspección IVC - Establecimiento de comercio"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el propósito de este formulario..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="label">Estado inicial</label>
            <div className="flex gap-3">
              {Object.values(SurveyStatus).map((s) => {
                const labels: Record<SurveyStatus, string> = {
                  DRAFT: 'Borrador',
                  ACTIVE: 'Activo',
                  INACTIVE: 'Inactivo',
                };
                return (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => setForm((prev) => ({ ...prev, status: s }))}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-[#c9d1d9]">{labels[s]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button type="button" onClick={() => navigate('/surveys')} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creando...' : 'Crear y agregar preguntas'}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateSurveyPage;
