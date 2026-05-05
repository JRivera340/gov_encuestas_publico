import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import Badge from '../components/ui/Badge';
import { surveysApi } from '../api/surveys.api';
import { categoriesApi } from '../api/categories.api';
import type { Survey, Category } from '../types';
import { SurveyStatus, CATEGORY_DISPLAY_NAMES } from '../types';
import {
  Plus,
  Search,
  Eye,
  Settings,
  Trash2,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const SurveysPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<SurveyStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState(
    searchParams.get('categoryId') ?? '',
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [survs, cats] = await Promise.all([
        surveysApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setSurveys(survs);
      setCategories(cats);
    } catch {
      toast('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta encuesta?')) return;
    try {
      await surveysApi.remove(id);
      setSurveys((prev) => prev.filter((s) => s.id !== id));
      toast('Encuesta eliminada', 'success');
    } catch {
      toast('Error eliminando encuesta', 'error');
    }
  };

  const filtered = surveys.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchCategory =
      !filterCategory ||
      s.subcategory?.category?.id === filterCategory ||
      s.subcategory?.categoryId === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <Layout>
      <Header
        title="Encuestas"
        subtitle={`${filtered.length} de ${surveys.length} encuesta${surveys.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={() => navigate('/surveys/new')} className="btn-primary">
            <Plus className="h-4 w-4" />
            Nueva encuesta
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58]" />
          <input
            className="input pl-9"
            placeholder="Buscar encuesta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select w-40"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SurveyStatus | '')}
        >
          <option value="">Todos los estados</option>
          {Object.values(SurveyStatus).map((s) => (
            <option key={s} value={s}>{s === 'ACTIVE' ? 'Activo' : s === 'DRAFT' ? 'Borrador' : 'Inactivo'}</option>
          ))}
        </select>
        <select
          className="select w-48"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {CATEGORY_DISPLAY_NAMES[c.name] ?? c.name}
            </option>
          ))}
        </select>
        <button onClick={fetchData} className="btn-ghost p-2.5 rounded-lg">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-[#21262d]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList className="h-10 w-10 text-[#484f58] mx-auto mb-3" />
          <p className="text-[#8b949e]">No se encontraron encuestas</p>
          {surveys.length === 0 && (
            <button onClick={() => navigate('/surveys/new')} className="btn-primary mt-4 mx-auto">
              <Plus className="h-4 w-4" />
              Crear primera encuesta
            </button>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] text-left">
                <th className="px-5 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Título</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Categoría</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Subcategoría</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Preguntas</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {filtered.map((survey) => (
                <tr key={survey.id} className="group hover:bg-[#21262d] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#e6edf3]">{survey.title}</p>
                    {survey.description && (
                      <p className="text-xs text-[#484f58] mt-0.5 line-clamp-1">{survey.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[#8b949e] text-xs">
                    {CATEGORY_DISPLAY_NAMES[survey.subcategory?.category?.name ?? ''] ?? survey.subcategory?.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[#8b949e] text-xs">
                    {survey.subcategory?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={survey.status} />
                  </td>
                  <td className="px-4 py-3.5 text-[#8b949e] text-sm">
                    {survey.questions?.length ?? 0}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/surveys/${survey.id}/preview`)}
                        className="btn-ghost p-1.5 rounded-lg"
                        title="Vista previa"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/surveys/${survey.id}/builder`)}
                        className="btn-ghost p-1.5 rounded-lg"
                        title="Editar"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="btn-ghost p-1.5 rounded-lg text-red-400 hover:bg-red-600/10"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default SurveysPage;
