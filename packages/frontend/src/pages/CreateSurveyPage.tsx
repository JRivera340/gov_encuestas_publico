import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import { surveysApi } from '../api/surveys.api';
import { questionsApi } from '../api/questions.api';
import { categoriesApi } from '../api/categories.api';
import type { Category, Subcategory, CreateSurveyPayload, CreateQuestionPayload } from '../types';
import { SurveyStatus, QuestionType, CATEGORY_DISPLAY_NAMES, SURVEY_ROLES } from '../types';
import { ArrowLeft, ArrowRight, Upload, FileJson, CheckCircle2, X } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const normalizeName = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

// Normaliza un arreglo de preguntas de JSON a payloads válidos. Devuelve error legible.
const parseQuestions = (
  arr: any[],
): { payloads: CreateQuestionPayload[]; error: string | null } => {
  const validTypes = Object.values(QuestionType) as string[];
  const payloads: CreateQuestionPayload[] = [];
  for (let i = 0; i < arr.length; i++) {
    const q = arr[i];
    if (!q || typeof q !== 'object') return { payloads: [], error: `Pregunta ${i + 1}: formato inválido` };
    const type = String(q.type || '').toUpperCase();
    if (!validTypes.includes(type)) {
      return { payloads: [], error: `Pregunta ${i + 1}: tipo inválido "${q.type}". Tipos válidos: ${validTypes.join(', ')}` };
    }
    const label = String(q.label || '').trim();
    if (!label) return { payloads: [], error: `Pregunta ${i + 1}: falta el enunciado (label)` };
    const name = String(q.name || '').trim() || normalizeName(label);
    const options = Array.isArray(q.options)
      ? q.options.map((o: any) =>
          typeof o === 'string'
            ? { label: o, value: normalizeName(o) }
            : {
                label: String(o?.label ?? o?.value ?? ''),
                value: String(o?.value ?? normalizeName(String(o?.label ?? ''))),
              },
        )
      : undefined;
    payloads.push({
      type: type as CreateQuestionPayload['type'],
      name,
      label,
      placeholder: q.placeholder ? String(q.placeholder) : undefined,
      required: !!q.required,
      options,
      config: q.config && typeof q.config === 'object' ? q.config : undefined,
    });
  }
  return { payloads, error: null };
};

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
    visibleRoles: undefined,
  });
  const [saving, setSaving] = useState(false);

  // Importación por JSON
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importedQuestions, setImportedQuestions] = useState<CreateQuestionPayload[]>([]);

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

  // Resuelve categoría/subcategoría por nombre (tolerante a tildes/mayúsculas).
  const resolvePlacement = (categoryName?: string, subcategoryName?: string) => {
    if (!categoryName) return;
    const cn = normalizeName(String(categoryName));
    const cat = categories.find(
      (c) =>
        normalizeName(c.name) === cn ||
        normalizeName(CATEGORY_DISPLAY_NAMES[c.name] ?? '') === cn,
    );
    if (!cat) {
      toast(`No se encontró la categoría "${categoryName}"`, 'error');
      return;
    }
    setSelectedCategory(cat.id);
    if (subcategoryName) {
      const sn = normalizeName(String(subcategoryName));
      const sub = (cat.subcategories ?? []).find((s) => normalizeName(s.name) === sn);
      if (!sub) {
        toast(`No se encontró la subcategoría "${subcategoryName}" en ${cat.name}`, 'error');
        return;
      }
      // El efecto de selectedCategory limpia subcategoryId; lo fijamos después.
      setTimeout(() => setForm((prev) => ({ ...prev, subcategoryId: sub.id })), 0);
    }
  };

  const handleLoadJson = () => {
    let parsed: any;
    try {
      parsed = JSON.parse(importText);
    } catch {
      toast('JSON inválido: revisa la sintaxis', 'error');
      return;
    }
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
        ? parsed.questions
        : null;
    if (!arr) {
      toast('El JSON debe traer un arreglo de preguntas o { "questions": [...] }', 'error');
      return;
    }
    const { payloads, error } = parseQuestions(arr);
    if (error) {
      toast(error, 'error');
      return;
    }

    // Campos de la encuesta (si el JSON es un objeto, no un arreglo).
    if (!Array.isArray(parsed)) {
      if (parsed.title) setForm((prev) => ({ ...prev, title: String(parsed.title) }));
      if (parsed.description) setForm((prev) => ({ ...prev, description: String(parsed.description) }));
      const st = String(parsed.status || '').toUpperCase();
      if ((Object.values(SurveyStatus) as string[]).includes(st)) {
        setForm((prev) => ({ ...prev, status: st as SurveyStatus }));
      }
      if (Array.isArray(parsed.visibleRoles)) {
        const valid = SURVEY_ROLES.map((r) => r.value);
        const roles = parsed.visibleRoles.map(String).filter((r: string) => valid.includes(r));
        setForm((prev) => ({ ...prev, visibleRoles: roles }));
      }
      if (parsed.category) resolvePlacement(parsed.category, parsed.subcategory);
    }

    setImportedQuestions(payloads);
    setImportOpen(false);
    toast(`${payloads.length} pregunta(s) cargada(s) del JSON`, 'success');
  };

  const handleFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subcategoryId) {
      toast('Selecciona una subcategoría', 'error');
      return;
    }
    setSaving(true);
    try {
      const survey = await surveysApi.create(form);

      // Crear las preguntas importadas (si hay), respetando el orden del JSON.
      let createdCount = 0;
      for (let i = 0; i < importedQuestions.length; i++) {
        try {
          await questionsApi.create(survey.id, { ...importedQuestions[i], order: i });
          createdCount++;
        } catch {
          break;
        }
      }

      if (importedQuestions.length > 0) {
        if (createdCount === importedQuestions.length) {
          toast(`Encuesta creada con ${createdCount} pregunta(s)`, 'success');
        } else {
          toast(`Encuesta creada. Se cargaron ${createdCount}/${importedQuestions.length} preguntas`, 'error');
        }
      } else {
        toast('Encuesta creada exitosamente', 'success');
      }
      navigate(`/surveys/${survey.id}/builder`);
    } catch {
      toast('Error creando encuesta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const exampleJson = useMemo(
    () =>
      JSON.stringify(
        {
          title: 'Formulario IVC - Parqueaderos',
          description: 'Inspección de parqueaderos',
          status: 'DRAFT',
          category: 'IVC',
          subcategory: 'Parqueaderos',
          visibleRoles: ['GESTOR'],
          questions: [
            { type: 'TEXT', name: 'nombre_establecimiento', label: 'Nombre del establecimiento', required: true },
            { type: 'NUMBER', label: 'Vehículos inspeccionados' },
            {
              type: 'SELECT',
              label: '¿Cumple normativa?',
              required: true,
              options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
              ],
            },
          ],
        },
        null,
        2,
      ),
    [],
  );

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

      <div className="max-w-2xl space-y-4">
        {/* Importar desde JSON */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-[#c9d1d9]">Subir encuesta desde JSON</p>
                <p className="text-xs text-[#8b949e]">
                  Crea la encuesta y todas sus preguntas de una vez.
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setImportOpen((v) => !v)} className="btn-secondary">
              <Upload className="h-4 w-4" />
              {importOpen ? 'Cerrar' : 'Subir JSON'}
            </button>
          </div>

          {importedQuestions.length > 0 && !importOpen && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-700/40 bg-emerald-900/20 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">
                {importedQuestions.length} pregunta(s) listas para crear con la encuesta.
              </span>
              <button
                type="button"
                onClick={() => setImportedQuestions([])}
                className="ml-auto text-[#8b949e] hover:text-[#c9d1d9]"
                title="Descartar preguntas cargadas"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {importOpen && (
            <div className="mt-4 space-y-3">
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="block w-full text-xs text-[#8b949e] file:mr-3 file:rounded-md file:border-0 file:bg-[#21262d] file:px-3 file:py-1.5 file:text-[#c9d1d9]"
              />
              <textarea
                className="input resize-y font-mono text-xs"
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={exampleJson}
              />
              <p className="text-[11px] text-[#8b949e]">
                Acepta un objeto con <code>title, category, subcategory, status, visibleRoles, questions[]</code> o
                directamente un arreglo de preguntas. Tipos válidos: {(Object.values(QuestionType) as string[]).join(', ')}.
              </p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setImportText(exampleJson)} className="btn-ghost text-xs">
                  Ver ejemplo
                </button>
                <button type="button" onClick={handleLoadJson} className="btn-primary">
                  Cargar JSON
                </button>
              </div>
            </div>
          )}
        </div>

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
              {saving
                ? 'Creando...'
                : importedQuestions.length > 0
                  ? `Crear con ${importedQuestions.length} pregunta(s)`
                  : 'Crear y agregar preguntas'}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateSurveyPage;
