import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import CategoryCard from '../components/ui/CategoryCard';
import { categoriesApi } from '../api/categories.api';
import { surveysApi } from '../api/surveys.api';
import type { Category, Survey } from '../types';
import { SurveyStatus } from '../types';
import { LayoutDashboard, RefreshCw, AlertCircle, Database, Plus } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';

const DashboardPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [savingCategory, setSavingCategory] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, survs] = await Promise.all([
        categoriesApi.getAll(),
        surveysApi.getAll(),
      ]);
      setCategories(cats);
      setSurveys(survs);
    } catch {
      setError('Error de conexión con el servidor de Railway. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  const runSeed = async () => {
    try {
      const res = await fetch('https://backendencuestas-production-d973.up.railway.app/seed', { method: 'POST' });
      const data = await res.json();
      toast(`Seed ejecutado: ${data.created} registros creados`, 'success');
      fetchData();
    } catch {
      toast('Error ejecutando seed', 'error');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    setSavingCategory(true);
    try {
      await categoriesApi.create(newCategory);
      toast('Categoría creada con éxito', 'success');
      setCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Error al crear categoría', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const activeCount = surveys.filter((s) => s.status === SurveyStatus.ACTIVE).length;
  const draftCount = surveys.filter((s) => s.status === SurveyStatus.DRAFT).length;

  return (
    <Layout>
      <Header
        title="Dashboard"
        subtitle="Vista general del módulo de encuestas"
        actions={
          <div className="flex items-center gap-2">
            {!loading && (
              <button onClick={runSeed} className="btn-secondary text-xs gap-1.5" title="Reiniciar base de datos">
                <Database className="h-3.5 w-3.5" />
                Inicializar datos
              </button>
            )}
            <button onClick={fetchData} className="btn-ghost p-2 rounded-lg" aria-label="Refrescar">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setCategoryModal(true)} 
              className="btn-primary py-2 px-3 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva Categoría
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Categorías', value: categories.length, color: 'text-blue-400' },
          { label: 'Encuestas activas', value: activeCount, color: 'text-emerald-400' },
          { label: 'Borradores', value: draftCount, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p className="text-[#8b949e] text-xs mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 mb-6">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">{error}</p>
            <p className="text-xs text-[#8b949e] mt-1">
              Corre <code className="text-amber-400">npm run dev:backend</code> en la raíz del proyecto
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mb-3 flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4 text-[#8b949e]" />
        <h2 className="section-title">Categorías</h2>
        <span className="text-xs text-[#484f58]">({categories.length})</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-[#21262d]" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-12">
          <Database className="h-8 w-8 text-[#484f58] mx-auto mb-3" />
          <p className="text-[#8b949e] text-sm mb-4">
            No hay categorías. Inicializa los datos para comenzar.
          </p>
          <button onClick={runSeed} className="btn-primary mx-auto">
            <Database className="h-4 w-4" />
            Inicializar datos de categorías
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onUpdate={fetchData} />
          ))}
        </div>
      )}

      {/* Modal Nueva Categoría */}
      <Modal 
        open={categoryModal} 
        onClose={() => setCategoryModal(false)} 
        title="Crear Nueva Categoría"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: SALUD, EDUCACION..."
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Descripción (Opcional)
            </label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe brevemente el propósito de esta categoría"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setCategoryModal(false)} 
              className="btn-ghost"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary px-6" 
              disabled={savingCategory}
            >
              {savingCategory ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default DashboardPage;
