import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import SortableQuestion from '../components/builder/SortableQuestion';
import QuestionEditor from '../components/builder/QuestionEditor';
import { surveysApi } from '../api/surveys.api';
import { questionsApi } from '../api/questions.api';
import type { Survey, Question, CreateQuestionPayload } from '../types';
import { SurveyStatus, CATEGORY_DISPLAY_NAMES, QuestionType } from '../types';
import {
  ArrowLeft,
  Plus,
  Eye,
  Save,
  Layers,
  Upload,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const SurveyBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const JSON_IMPORT_EXAMPLE = `[
  { "type": "SECTION_HEADER", "label": "1. Información general" },
  { "type": "TEXT", "label": "Nombre del establecimiento", "name": "nombre_establecimiento", "required": true },
  { "type": "SELECT", "label": "Tipo de local", "required": false,
    "options": [ { "label": "Comercio", "value": "comercio" }, { "label": "Vivienda", "value": "vivienda" } ] },
  { "type": "FILE", "label": "Acta del Operativo (PDF)", "name": "acta_pdf", "required": true,
    "config": { "accept": "application/pdf", "maxSizeMB": 10 } }
]`;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchSurvey = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const s = await surveysApi.getOne(id);
      setSurvey(s);
      const sorted = [...(s.questions ?? [])].sort((a, b) => a.order - b.order);
      setQuestions(sorted);
    } catch {
      toast('Error cargando encuesta', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSurvey(); }, [fetchSurvey]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reordered);

    try {
      await questionsApi.reorder(id!, reordered.map((q) => q.id));
    } catch {
      toast('Error guardando orden', 'error');
    }
  };

  const handleSaveQuestion = async (payload: CreateQuestionPayload) => {
    if (!id) return;
    setSaving(true);
    try {
      if (editingQuestion) {
        const updated = await questionsApi.update(editingQuestion.id, payload);
        setQuestions((prev) =>
          prev.map((q) => (q.id === updated.id ? updated : q)),
        );
        toast('Pregunta actualizada', 'success');
      } else {
        const created = await questionsApi.create(id, {
          ...payload,
          order: questions.length,
        });
        setQuestions((prev) => [...prev, created]);
        toast('Pregunta agregada', 'success');
      }
      setModalOpen(false);
      setEditingQuestion(null);
    } catch {
      toast('Error guardando pregunta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const normalizeName = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

  const handleImportJson = async () => {
    if (!id) return;

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
      toast('El JSON debe ser un arreglo de preguntas o un objeto { "questions": [...] }', 'error');
      return;
    }

    const validTypes = Object.values(QuestionType) as string[];
    const payloads: CreateQuestionPayload[] = [];

    for (let i = 0; i < arr.length; i++) {
      const q = arr[i];
      if (!q || typeof q !== 'object') {
        toast(`Pregunta ${i + 1}: formato inválido`, 'error');
        return;
      }
      const type = String(q.type || '').toUpperCase();
      if (!validTypes.includes(type)) {
        toast(`Pregunta ${i + 1}: tipo inválido "${q.type}". Tipos válidos: ${validTypes.join(', ')}`, 'error');
        return;
      }
      const label = String(q.label || '').trim();
      if (!label) {
        toast(`Pregunta ${i + 1}: falta el enunciado (label)`, 'error');
        return;
      }
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

    if (payloads.length === 0) {
      toast('No hay preguntas para importar', 'error');
      return;
    }

    setImporting(true);
    const createdQuestions: Question[] = [];
    try {
      for (let i = 0; i < payloads.length; i++) {
        const created = await questionsApi.create(id, {
          ...payloads[i],
          order: questions.length + i,
        });
        createdQuestions.push(created);
      }
      setQuestions((prev) => [...prev, ...createdQuestions]);
      toast(`${createdQuestions.length} pregunta(s) importada(s)`, 'success');
      setImportOpen(false);
      setImportText('');
    } catch {
      if (createdQuestions.length) setQuestions((prev) => [...prev, ...createdQuestions]);
      toast(
        `Se importaron ${createdQuestions.length} de ${payloads.length}. Error en la pregunta ${createdQuestions.length + 1}.`,
        'error',
      );
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteQuestion = async (qid: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    try {
      await questionsApi.remove(qid);
      setQuestions((prev) => prev.filter((q) => q.id !== qid));
      toast('Pregunta eliminada', 'success');
    } catch {
      toast('Error eliminando pregunta', 'error');
    }
  };

  const handleStatusChange = async (status: SurveyStatus) => {
    if (!id || !survey) return;
    setStatusSaving(true);
    try {
      const updated = await surveysApi.update(id, { status });
      setSurvey(updated);
      toast(`Estado cambiado a ${status}`, 'success');
    } catch {
      toast('Error cambiando estado', 'error');
    } finally {
      setStatusSaving(false);
    }
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!survey) {
    return (
      <Layout>
        <div className="card text-center py-16">
          <p className="text-[#8b949e]">Encuesta no encontrada</p>
          <button onClick={() => navigate('/surveys')} className="btn-secondary mt-4 mx-auto">
            Volver
          </button>
        </div>
      </Layout>
    );
  }

  const catName = CATEGORY_DISPLAY_NAMES[survey.subcategory?.category?.name ?? ''] ??
    survey.subcategory?.category?.name ?? '';

  return (
    <Layout>
      <Header
        title={survey.title}
        subtitle={`${catName} → ${survey.subcategory?.name ?? ''}`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/surveys/${id}/preview`)} className="btn-secondary">
              <Eye className="h-4 w-4" />
              Vista previa
            </button>
            <button onClick={() => navigate('/surveys')} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Main — Questions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#8b949e]" />
              <h2 className="section-title">Preguntas</h2>
              <span className="text-xs text-[#484f58]">({questions.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setImportText(''); setImportOpen(true); }}
                className="btn-secondary"
                title="Importar preguntas desde JSON"
              >
                <Upload className="h-4 w-4" />
                Importar JSON
              </button>
              <button
                onClick={() => { setEditingQuestion(null); setModalOpen(true); }}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" />
                Agregar pregunta
              </button>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="card text-center py-16">
              <Layers className="h-10 w-10 text-[#484f58] mx-auto mb-3" />
              <p className="text-[#8b949e] mb-4">Este formulario no tiene preguntas aún.</p>
              <button
                onClick={() => { setEditingQuestion(null); setModalOpen(true); }}
                className="btn-primary mx-auto"
              >
                <Plus className="h-4 w-4" />
                Agregar primera pregunta
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <SortableQuestion
                      key={q.id}
                      question={q}
                      index={i}
                      onEdit={openEdit}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Sidebar — Survey info */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card">
            <p className="label mb-2">Estado del formulario</p>
            <Badge status={survey.status} />
            <div className="mt-3 space-y-1.5">
              {Object.values(SurveyStatus).map((s) => {
                const labels: Record<SurveyStatus, string> = {
                  ACTIVE: 'Activar',
                  DRAFT: 'Marcar como borrador',
                  INACTIVE: 'Desactivar',
                };
                if (s === survey.status) return null;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusSaving}
                    className="btn-secondary w-full justify-start text-xs"
                  >
                    <Save className="h-3 w-3" />
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="card space-y-3">
            <p className="label">Información</p>
            <div>
              <p className="text-[10px] text-[#484f58] uppercase tracking-wide">Categoría</p>
              <p className="text-sm text-[#e6edf3] mt-0.5">{catName}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#484f58] uppercase tracking-wide">Subcategoría</p>
              <p className="text-sm text-[#e6edf3] mt-0.5">{survey.subcategory?.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#484f58] uppercase tracking-wide">Versión</p>
              <p className="text-sm text-[#e6edf3] mt-0.5">v{survey.version}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#484f58] uppercase tracking-wide">Preguntas</p>
              <p className="text-sm text-[#e6edf3] mt-0.5">{questions.length}</p>
            </div>
            {survey.description && (
              <div>
                <p className="text-[10px] text-[#484f58] uppercase tracking-wide">Descripción</p>
                <p className="text-xs text-[#8b949e] mt-0.5">{survey.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingQuestion(null); }}
        title={editingQuestion ? 'Editar pregunta' : 'Nueva pregunta'}
        maxWidth="max-w-xl"
      >
        <QuestionEditor
          initialData={editingQuestion ?? undefined}
          onSave={handleSaveQuestion}
          onCancel={() => { setModalOpen(false); setEditingQuestion(null); }}
          isSaving={saving}
        />
      </Modal>

      {/* Modal — Importar JSON */}
      <Modal
        open={importOpen}
        onClose={() => { if (!importing) { setImportOpen(false); setImportText(''); } }}
        title="Importar preguntas desde JSON"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#8b949e]">
            Pega un arreglo de preguntas (o un objeto <code className="text-blue-400">{'{ "questions": [...] }'}</code>).
            Las preguntas se agregan al final del formulario. Si no defines <code className="text-blue-400">name</code>,
            se genera a partir del enunciado.
          </p>
          <details className="text-xs text-[#8b949e]">
            <summary className="cursor-pointer text-blue-400 select-none">Ver formato de ejemplo</summary>
            <pre className="mt-2 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] overflow-x-auto text-[11px] leading-relaxed">{JSON_IMPORT_EXAMPLE}</pre>
            <p className="mt-2">
              Tipos válidos: {(Object.values(QuestionType) as string[]).join(', ')}.
            </p>
          </details>
          <textarea
            className="input font-mono text-xs min-h-[260px]"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[ { "type": "TEXT", "label": "Nombre", "required": true } ]'
            spellCheck={false}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={() => { setImportOpen(false); setImportText(''); }}
              disabled={importing}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImportJson}
              disabled={importing || !importText.trim()}
              className="btn-primary"
            >
              <Upload className="h-4 w-4" />
              {importing ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default SurveyBuilderPage;
