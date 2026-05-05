import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { surveysApi } from '../api/surveys.api';
import type { Survey, Question } from '../types';
import { QuestionType, parseOptions, CATEGORY_DISPLAY_NAMES, CATEGORY_COLORS } from '../types';
import { ArrowLeft, Settings, Star } from 'lucide-react';

const SurveyPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    surveysApi.getOne(id)
      .then((s) => {
        setSurvey(s);
        const sorted = [...(s.questions ?? [])].sort((a, b) => a.order - b.order);
        setSurvey({ ...s, questions: sorted });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-[#8b949e]">Encuesta no encontrada</p>
      </div>
    );
  }

  const catName = survey.subcategory?.category?.name ?? '';
  const colors = CATEGORY_COLORS[catName] ?? {
    bg: 'from-gray-500/20 to-gray-600/10',
    accent: 'bg-gray-500',
    text: 'text-gray-400',
  };
  const displayCat = CATEGORY_DISPLAY_NAMES[catName] ?? catName;
  const sortedQuestions = [...(survey.questions ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/surveys/${id}/builder`)}
              className="btn-ghost p-1.5 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs text-[#484f58]">Vista previa</p>
              <p className="text-sm font-medium text-[#e6edf3]">{survey.title}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/surveys/${id}/builder`)}
            className="btn-secondary text-xs"
          >
            <Settings className="h-3.5 w-3.5" />
            Editar
          </button>
        </div>
      </div>

      {/* Form header */}
      <div className={`bg-gradient-to-r ${colors.bg} border-b border-[#30363d]`}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${colors.text} bg-current/10 border border-current/20`}>
              {displayCat}
            </span>
            <span className="text-[#8b949e] text-xs">→</span>
            <span className="text-xs text-[#8b949e]">{survey.subcategory?.name}</span>
          </div>
          <h1 className="text-xl font-bold text-[#e6edf3] mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-sm text-[#8b949e]">{survey.description}</p>
          )}
          <p className="text-xs text-[#484f58] mt-3">
            {sortedQuestions.length} campo{sortedQuestions.length !== 1 ? 's' : ''} ·{' '}
            {sortedQuestions.filter((q) => q.required).length} obligatorio{sortedQuestions.filter((q) => q.required).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#8b949e]">Este formulario no tiene preguntas.</p>
            <button
              onClick={() => navigate(`/surveys/${id}/builder`)}
              className="btn-primary mt-4 mx-auto"
            >
              Agregar preguntas
            </button>
          </div>
        ) : (
          sortedQuestions.map((q, i) => (
            <QuestionPreview key={q.id} question={q} index={i} />
          ))
        )}

        {/* Submit button preview */}
        {sortedQuestions.length > 0 && (
          <div className="pt-4 border-t border-[#30363d]">
            <button
              disabled
              className="btn-primary w-full justify-center opacity-60 cursor-not-allowed"
            >
              Enviar formulario
            </button>
            <p className="text-center text-xs text-[#484f58] mt-2">
              Vista previa — el formulario no es funcional desde aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Inner component ────────────────────────────────────────────────────────────

const QuestionPreview: React.FC<{ question: Question; index: number }> = ({
  question,
  index,
}) => {
  const options = parseOptions(question.options);

  const renderInput = () => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <input
            disabled
            className="input opacity-70 cursor-not-allowed"
            placeholder={question.placeholder ?? 'Escribe aquí...'}
          />
        );
      case QuestionType.TEXTAREA:
        return (
          <textarea
            disabled
            rows={3}
            className="input resize-none opacity-70 cursor-not-allowed"
            placeholder={question.placeholder ?? 'Escribe aquí...'}
          />
        );
      case QuestionType.NUMBER:
        return (
          <input
            type="number"
            disabled
            className="input opacity-70 cursor-not-allowed"
            placeholder={question.placeholder ?? '0'}
          />
        );
      case QuestionType.DATE:
        return (
          <input
            type="date"
            disabled
            className="input opacity-70 cursor-not-allowed"
          />
        );
      case QuestionType.SELECT:
        return (
          <select disabled className="select opacity-70 cursor-not-allowed">
            <option>Seleccionar...</option>
            {options.map((o) => <option key={o.value}>{o.label}</option>)}
          </select>
        );
      case QuestionType.MULTISELECT:
        return (
          <select disabled multiple size={Math.min(options.length + 1, 4)} className="select opacity-70 cursor-not-allowed">
            {options.map((o) => <option key={o.value}>{o.label}</option>)}
          </select>
        );
      case QuestionType.RADIO:
        return (
          <div className="space-y-2">
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 cursor-not-allowed">
                <input type="radio" disabled name={`q-${question.id}`} className="accent-blue-500" />
                <span className="text-sm text-[#c9d1d9]">{o.label}</span>
              </label>
            ))}
          </div>
        );
      case QuestionType.CHECKBOX:
        return (
          <div className="space-y-2">
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 cursor-not-allowed">
                <input type="checkbox" disabled className="accent-blue-500" />
                <span className="text-sm text-[#c9d1d9]">{o.label}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xs text-[#484f58] mt-0.5">#{index + 1}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#e6edf3]">
            {question.label}
            {question.required && (
              <Star className="inline h-2.5 w-2.5 text-amber-400 fill-current ml-1.5 -mt-0.5" />
            )}
          </p>
        </div>
      </div>
      {renderInput()}
    </div>
  );
};

export default SurveyPreviewPage;
