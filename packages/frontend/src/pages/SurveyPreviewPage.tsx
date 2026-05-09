import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { surveysApi } from '../api/surveys.api';
import type { Survey, Question, QuestionOption } from '../types';
import { QuestionType, parseOptions, parseConfig, CATEGORY_DISPLAY_NAMES, CATEGORY_COLORS } from '../types';
import { ArrowLeft, Settings, Star, MapPin, Upload, FileText, CheckCircle2, Play, Code, X } from 'lucide-react';

const SurveyPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (!id) return;
    surveysApi.getOne(id)
      .then((s) => {
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
  const sortedQuestions = survey.questions ?? [];

  const handleAnswerChange = (name: string, value: any) => {
    setAnswers(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Toolbar */}
      <div className="sticky top-0 z-[9999] border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/surveys/${id}/builder`)}
              className="p-1.5 rounded-lg hover:bg-[#30363d] transition-colors text-[#8b949e]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] text-[#484f58] uppercase font-bold tracking-wider">Módulo de Encuestas</p>
              <p className="text-sm font-medium text-[#e6edf3] truncate max-w-[200px]">{survey.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInteractiveMode(!interactiveMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                interactiveMode 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:border-[#8b949e]'
              }`}
            >
              <Play className={`h-3.5 w-3.5 ${interactiveMode ? 'fill-current' : ''}`} />
              {interactiveMode ? 'Modo Simulación Activo' : 'Simular Formulario'}
            </button>
            <div className="h-4 w-[1px] bg-[#30363d] mx-1" />
            <button
              onClick={() => navigate(`/surveys/${id}/builder`)}
              className="p-2 rounded-lg hover:bg-[#30363d] text-[#8b949e]"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Form header */}
      <div className={`bg-gradient-to-r ${colors.bg} border-b border-[#30363d] relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="max-w-2xl mx-auto px-6 py-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors.text} bg-current/10 border border-current/20`}>
              {displayCat}
            </span>
            <span className="text-[#484f58] text-xs">/</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">{survey.subcategory?.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#e6edf3] mb-3">{survey.title}</h1>
          {survey.description && (
            <p className="text-sm text-[#8b949e] leading-relaxed max-w-xl">{survey.description}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {interactiveMode && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-start gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wide">Modo Simulación</p>
              <p className="text-xs text-amber-500/70 mt-0.5">
                Los campos son interactivos. Al terminar, podrás ver el JSON que se enviaría al proyecto de Railway.
              </p>
            </div>
          </div>
        )}

        {sortedQuestions.length === 0 ? (
          <div className="text-center py-20 bg-[#161b22] rounded-2xl border border-dashed border-[#30363d]">
            <p className="text-[#8b949e]">Este formulario no tiene preguntas.</p>
            <button
              onClick={() => navigate(`/surveys/${id}/builder`)}
              className="btn-primary mt-6 mx-auto"
            >
              Comenzar a construir
            </button>
          </div>
        ) : (
          sortedQuestions.map((q, i) => (
            <QuestionPreview 
              key={q.id} 
              question={q} 
              index={i} 
              interactive={interactiveMode}
              value={answers[q.name]}
              onChange={(val) => handleAnswerChange(q.name, val)}
            />
          ))
        )}

        {/* Submit button preview */}
        {sortedQuestions.length > 0 && (
          <div className="pt-10 border-t border-[#30363d] space-y-4">
            <button
              onClick={() => setShowJson(true)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                interactiveMode 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-[#21262d] text-[#484f58] border border-[#30363d] cursor-not-allowed'
              }`}
            >
              {interactiveMode ? (
                <>
                  <Code className="h-5 w-5" />
                  Ver JSON Final (Payload)
                </>
              ) : 'Enviar Formulario'}
            </button>
            <p className="text-center text-[10px] text-[#484f58] font-medium uppercase tracking-widest">
              Gobernación - Gestión de Encuestas v{survey.version}.0
            </p>
          </div>
        )}
      </div>

      {/* JSON Modal */}
      {showJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-[#e6edf3]">Payload Resultante</h3>
              </div>
              <button onClick={() => setShowJson(false)} className="p-1 hover:bg-[#30363d] rounded-md transition-colors">
                <X className="h-4 w-4 text-[#8b949e]" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 font-mono text-xs">
              <pre className="text-green-400 leading-relaxed">
                {JSON.stringify({
                  surveyId: survey.id,
                  version: survey.version,
                  timestamp: new Date().toISOString(),
                  data: answers
                }, null, 2)}
              </pre>
            </div>
            <div className="p-4 bg-[#0d1117] border-t border-[#30363d] flex justify-end">
              <button onClick={() => setShowJson(false)} className="btn-primary py-2 px-6">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Inner components ────────────────────────────────────────────────────────────

const QuestionPreview: React.FC<{ 
  question: Question; 
  index: number; 
  interactive: boolean;
  value: any;
  onChange: (val: any) => void;
}> = ({ question, index, interactive, value, onChange }) => {
  const options = parseOptions(question.options);
  const config = parseConfig(question.config);

  if (question.type === QuestionType.SECTION_HEADER) {
    return (
      <div className="pt-12 pb-4 first:pt-0">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">
            {question.label}
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-blue-500/30 to-transparent" />
        </div>
      </div>
    );
  }

  const renderInput = () => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <input
            value={value || ''}
            onChange={(e) => interactive && onChange(e.target.value)}
            disabled={!interactive}
            className="input focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={question.placeholder ?? 'Escribe aquí...'}
          />
        );
      case QuestionType.TEXTAREA:
        return (
          <textarea
            value={value || ''}
            onChange={(e) => interactive && onChange(e.target.value)}
            disabled={!interactive}
            rows={3}
            className="input resize-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={question.placeholder ?? 'Escribe aquí...'}
          />
        );
      case QuestionType.NUMBER:
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => interactive && onChange(Number(e.target.value))}
            disabled={!interactive}
            className="input focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={config.defaultValue?.toString() ?? '0'}
          />
        );
      case QuestionType.DATE:
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => interactive && onChange(e.target.value)}
            disabled={!interactive}
            className="input focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        );
      case QuestionType.SELECT:
        return (
          <select 
            value={value || ''}
            onChange={(e) => interactive && onChange(e.target.value)}
            disabled={!interactive} 
            className="select"
          >
            <option value="">Seleccionar...</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case QuestionType.RADIO:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((o) => (
              <label 
                key={o.value} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  value === o.value 
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]'
                } ${!interactive ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <input 
                  type="radio" 
                  checked={value === o.value}
                  onChange={() => interactive && onChange(o.value)}
                  disabled={!interactive} 
                  name={`q-${question.id}`} 
                  className="accent-blue-500 h-4 w-4" 
                />
                <span className="text-sm font-medium">{o.label}</span>
              </label>
            ))}
          </div>
        );
      case QuestionType.CHECKBOX:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.length > 0 ? (
              options.map((o) => {
                const checked = Array.isArray(value) && value.includes(o.value);
                return (
                  <label 
                    key={o.value} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      checked 
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                        : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]'
                    } ${!interactive ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={checked}
                      onChange={(e) => {
                        if (!interactive) return;
                        const current = Array.isArray(value) ? value : [];
                        if (e.target.checked) onChange([...current, o.value]);
                        else onChange(current.filter(v => v !== o.value));
                      }}
                      disabled={!interactive} 
                      className="accent-blue-500 h-4 w-4 rounded" 
                    />
                    <span className="text-sm font-medium">{o.label}</span>
                  </label>
                );
              })
            ) : (
              // Case for single checkbox (boolean toggle)
              <label 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  value === true 
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]'
                } ${!interactive ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <input 
                  type="checkbox" 
                  checked={value === true}
                  onChange={(e) => interactive && onChange(e.target.checked)}
                  disabled={!interactive} 
                  className="accent-blue-500 h-4 w-4 rounded" 
                />
                <span className="text-sm font-medium">{question.label}</span>
              </label>
            )}
          </div>
        );
      case QuestionType.MULTISELECT:
        return (
          <div className="space-y-2">
            <select 
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                if (!interactive) return;
                const vals = Array.from(e.target.selectedOptions, opt => opt.value);
                onChange(vals);
              }}
              disabled={!interactive} 
              className="select min-h-[100px]"
            >
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <p className="text-[10px] text-[#484f58]">Manten presionado Ctrl (o Cmd) para seleccionar varios</p>
          </div>
        );
      case QuestionType.FILE:
        return <FilePreviewMock question={question} interactive={interactive} value={value} onChange={onChange} />;
      case QuestionType.LOCATION:
        return <LocationPreviewMock question={question} interactive={interactive} value={value} onChange={onChange} />;
      case QuestionType.ENTITY_SELECT:
        return <EntitySelectMock interactive={interactive} value={value} onChange={onChange} />;
      default:
        return (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-xs text-red-400 font-mono">Tipo "{question.type}" no implementado en vista previa.</p>
          </div>
        );
    }
  };

  return (
    <div className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
      interactive ? 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/50' : 'bg-transparent border-[#30363d]'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#484f58] bg-[#0d1117] px-1.5 py-0.5 rounded uppercase tracking-wider">
              {question.name}
            </span>
            {question.required && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-tighter">
                <Star className="h-2 w-2 fill-current" />
                Requerido
              </span>
            )}
          </div>
          <p className="text-base font-bold text-[#e6edf3] leading-snug">
            {question.label}
          </p>
        </div>
      </div>
      <div className="relative">
        {renderInput()}
      </div>
    </div>
  );
};

// ── Specific Simulation Components ─────────────────────────────────────────────

const FilePreviewMock: React.FC<{ question: Question; interactive: boolean; value: any; onChange: (v: any) => void }> = ({ question, interactive, value, onChange }) => {
  const config = parseConfig(question.config);
  const isPDF = config.accept?.includes('pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const mockFiles = Array.from(files).map(f => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: f.type
    }));
    onChange(mockFiles);
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => interactive && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 transition-all ${
          interactive 
            ? 'border-[#30363d] hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer' 
            : 'border-[#30363d] opacity-50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={config.accept}
          multiple={config.maxFiles > 1}
          onChange={handleFile}
        />
        {isPDF ? <FileText className="h-8 w-8 text-blue-500 mb-3" /> : <Upload className="h-8 w-8 text-[#8b949e] mb-3" />}
        <p className="text-sm font-bold text-[#e6edf3]">
          {isPDF ? 'Subir Acta (PDF)' : 'Subir Fotos de Evidencia'}
        </p>
        <p className="text-[10px] text-[#8b949e] mt-1 font-medium">
          Máximo {config.maxFiles || 1} archivo(s) • Hasta {config.maxSizeMB || 10}MB
        </p>
      </div>

      {value && Array.isArray(value) && value.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {value.map((f: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-xl">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#e6edf3] truncate">{f.name}</p>
                <p className="text-[10px] text-[#8b949e]">{f.size}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Webpack/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationPreviewMock: React.FC<{ question: Question; interactive: boolean; value: any; onChange: (v: any) => void }> = ({ interactive, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const position = value ? [parseFloat(value.lat), parseFloat(value.lng)] : [4.6097, -74.0817];

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!interactive) return;
        onChange({
          lat: e.latlng.lat.toFixed(6),
          lng: e.latlng.lng.toFixed(6),
          barrio: "Ubicación seleccionada", // Aquí iría la lógica de barrios en Railway
          accuracy: "Manual",
          timestamp: new Date().toISOString()
        });
      },
    });
    return null;
  };

  return (
    <div className="space-y-4">
      <div className={`relative h-64 w-full rounded-2xl overflow-hidden border border-[#30363d] bg-[#0d1117] z-[1]`}>
        <MapContainer 
          key={interactive ? 'active' : 'static'}
          center={position as [number, number]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={interactive}
          dragging={interactive}
          doubleClickZoom={interactive}
          touchZoom={interactive}
          zoomControl={interactive}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          {value && (
            <Marker position={[parseFloat(value.lat), parseFloat(value.lng)]} />
          )}
        </MapContainer>
        
        <div className="absolute top-2 right-2 z-[2000] bg-[#161b22]/90 px-2 py-1 rounded border border-[#30363d] text-[8px] font-bold text-blue-400 uppercase">
          Simulación con OpenStreetMap
        </div>
        
        {!interactive && (
          <div className="absolute inset-0 bg-black/20 z-[3000] flex items-center justify-center pointer-events-none">
            <p className="bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d] text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
              Activa simulación para interactuar
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#484f58] italic">
        * En la integración real, se aplicarán los límites geográficos (KMZ) del proyecto de Railway.
      </p>

      {value && (
        <div className="bg-[#161b22]/95 border border-blue-500/30 p-4 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-green-500 uppercase">Coordenadas Capturadas</p>
              <p className="text-sm font-bold text-white">Punto en el mapa</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="bg-[#0d1117] p-2 rounded-lg">
              <p className="text-[8px] text-[#484f58] uppercase font-bold">Latitud</p>
              <p className="text-[10px] font-mono text-blue-400">{value.lat}</p>
            </div>
            <div className="bg-[#0d1117] p-2 rounded-lg">
              <p className="text-[8px] text-[#484f58] uppercase font-bold">Longitud</p>
              <p className="text-[10px] font-mono text-blue-400">{value.lng}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EntitySelectMock: React.FC<{ interactive: boolean; value: any; onChange: (v: any) => void }> = ({ interactive, value = [], onChange }) => {
  const entities = ['UAESP', 'Policía Metropolitana', 'Secretaría de Salud', 'Alcaldía Local', 'Ejército Nacional', 'Gestores de Convivencia'];

  const toggle = (e: string) => {
    if (!interactive) return;
    const current = Array.isArray(value) ? value : [];
    if (current.includes(e)) {
      onChange(current.filter(i => i !== e));
    } else {
      onChange([...current, e]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {entities.map(e => {
        const isSelected = Array.isArray(value) && value.includes(e);
        return (
          <button
            key={e}
            type="button"
            onClick={() => toggle(e)}
            disabled={!interactive}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isSelected 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'
            } ${!interactive ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
};

export default SurveyPreviewPage;
