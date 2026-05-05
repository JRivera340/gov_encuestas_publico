import React from 'react';
import { QuestionType, QUESTION_TYPE_LABELS } from '../../types';
import {
  Type,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  List,
} from 'lucide-react';

const ICONS: Record<QuestionType, React.ReactNode> = {
  [QuestionType.TEXT]: <Type className="h-4 w-4" />,
  [QuestionType.TEXTAREA]: <AlignLeft className="h-4 w-4" />,
  [QuestionType.NUMBER]: <Hash className="h-4 w-4" />,
  [QuestionType.DATE]: <Calendar className="h-4 w-4" />,
  [QuestionType.SELECT]: <ChevronDown className="h-4 w-4" />,
  [QuestionType.MULTISELECT]: <List className="h-4 w-4" />,
  [QuestionType.RADIO]: <Circle className="h-4 w-4" />,
  [QuestionType.CHECKBOX]: <CheckSquare className="h-4 w-4" />,
};

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({ value, onChange }) => {
  const types = Object.values(QuestionType);

  return (
    <div className="grid grid-cols-2 gap-2">
      {types.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150
            ${value === type
              ? 'border-blue-500/50 bg-blue-600/10 text-blue-400'
              : 'border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#484f58] hover:text-[#e6edf3]'
            }`}
        >
          <span className="shrink-0 opacity-80">{ICONS[type]}</span>
          <span className="font-medium text-xs">{QUESTION_TYPE_LABELS[type]}</span>
        </button>
      ))}
    </div>
  );
};

export default QuestionTypeSelector;
