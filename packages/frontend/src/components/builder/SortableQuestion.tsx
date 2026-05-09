import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Question } from '../../types';
import { QUESTION_TYPE_LABELS, parseOptions } from '../../types';
import { GripVertical, Pencil, Trash2, Star } from 'lucide-react';

interface SortableQuestionProps {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  question,
  index,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const options = parseOptions(question.options);
  const isHeader = question.type === 'SECTION_HEADER';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card flex gap-3 group transition-all duration-200 ${
        isDragging
          ? 'opacity-50 border-blue-500/50 shadow-xl shadow-blue-500/10 scale-[1.02]'
          : 'card-hover'
      } ${isHeader ? 'bg-blue-500/5 border-blue-500/20' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[#484f58] hover:text-[#8b949e] cursor-grab active:cursor-grabbing mt-0.5 shrink-0 touch-none"
        aria-label="Arrastrar pregunta"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {!isHeader && <span className="text-xs font-medium text-[#484f58]">#{index + 1}</span>}
              <span className={`rounded-md border px-2 py-0.5 text-[11px] ${
                isHeader ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-[#21262d] border-[#30363d] text-[#8b949e]'
              }`}>
                {QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS] || question.type}
              </span>
              {question.required && !isHeader && (
                <span className="flex items-center gap-1 text-[11px] text-amber-400">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Requerido
                </span>
              )}
            </div>
            <p className={`font-medium ${isHeader ? 'text-blue-400 text-base' : 'text-sm text-[#e6edf3]'}`}>
              {question.label}
            </p>
            {question.placeholder && !isHeader && (
              <p className="text-xs text-[#484f58] mt-0.5 italic">{question.placeholder}</p>
            )}
            {options.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {options.slice(0, 4).map((opt) => (
                  <span
                    key={opt.value}
                    className="rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-0.5 text-[11px] text-[#8b949e]"
                  >
                    {opt.label}
                  </span>
                ))}
                {options.length > 4 && (
                  <span className="text-[11px] text-[#484f58]">+{options.length - 4} más</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <button
              onClick={() => onEdit(question)}
              className="btn-ghost p-1.5 rounded-lg"
              aria-label="Editar pregunta"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-600/10"
              aria-label="Eliminar pregunta"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortableQuestion;
