import React, { useState } from 'react';
import type { Question, QuestionOption, CreateQuestionPayload } from '../../types';
import { QuestionType, QUESTION_TYPE_LABELS, parseOptions } from '../../types';
import QuestionTypeSelector from './QuestionTypeSelector';
import { Plus, X } from 'lucide-react';

interface QuestionEditorProps {
  initialData?: Partial<Question>;
  onSave: (payload: CreateQuestionPayload) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const OPTION_TYPES: QuestionType[] = [
  QuestionType.SELECT,
  QuestionType.MULTISELECT,
  QuestionType.RADIO,
  QuestionType.CHECKBOX,
];

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [type, setType] = useState<QuestionType>(initialData?.type ?? QuestionType.TEXT);
  const [label, setLabel] = useState(initialData?.label ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [placeholder, setPlaceholder] = useState(initialData?.placeholder ?? '');
  const [required, setRequired] = useState(initialData?.required ?? false);
  const [options, setOptions] = useState<QuestionOption[]>(
    parseOptions(initialData?.options ?? null),
  );
  const [newOption, setNewOption] = useState('');

  const needsOptions = OPTION_TYPES.includes(type);

  const generateNameFromLabel = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9\s]/g, "")     // Quitar caracteres especiales
      .trim()
      .replace(/\s+/g, "_");           // Espacios a underscores
  };

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!initialData?.name && (!name || name === generateNameFromLabel(label))) {
      setName(generateNameFromLabel(val));
    }
  };

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    setOptions((prev) => [
      ...prev,
      { label: trimmed, value: trimmed.toLowerCase().replace(/\s+/g, '_') },
    ]);
    setNewOption('');
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !name.trim()) return;
    onSave({
      type,
      name: name.trim(),
      label: label.trim(),
      placeholder: placeholder.trim() || undefined,
      required,
      options: needsOptions ? options : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type */}
      <div>
        <label className="label">Tipo de pregunta</label>
        <QuestionTypeSelector value={type} onChange={setType} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Label */}
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Enunciado *</label>
          <input
            className="input"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Ej: ¿Cuál es el nombre...?"
            required
          />
        </div>

        {/* Technical Name */}
        <div className="col-span-2 sm:col-span-1">
          <label className="label">ID Técnico (name) *</label>
          <input
            className="input font-mono text-xs text-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="ej: nombre_establecimiento"
            required
          />
          <p className="text-[10px] text-[#484f58] mt-1">Identificador para integración</p>
        </div>
      </div>

      {/* Placeholder (solo para TEXT, TEXTAREA, NUMBER) */}
      {[QuestionType.TEXT, QuestionType.TEXTAREA, QuestionType.NUMBER].includes(type) && (
        <div>
          <label className="label">Texto de ayuda (placeholder)</label>
          <input
            className="input"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="Ej: Ingrese el nombre aquí..."
          />
        </div>
      )}

      {/* Options */}
      {needsOptions && (
        <div>
          <label className="label">Opciones</label>
          <div className="space-y-2 mb-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 input py-1.5 text-xs">{opt.label}</span>
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="btn-ghost p-1 text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
              placeholder="Nueva opción..."
            />
            <button type="button" onClick={addOption} className="btn-secondary shrink-0">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Required */}
      {!['SECTION_HEADER'].includes(type) && (
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <div
              className={`h-5 w-9 rounded-full transition-colors duration-200 ${required ? 'bg-blue-600' : 'bg-[#30363d]'}`}
            />
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${required ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </div>
          <span className="text-sm text-[#c9d1d9]">Campo obligatorio</span>
        </label>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isSaving || !label.trim() || !name.trim()} className="btn-primary">
          {isSaving ? 'Guardando...' : 'Guardar pregunta'}
        </button>
      </div>
    </form>
  );
};

export default QuestionEditor;
