import React from 'react';
import { SurveyStatus } from '../../types';

const STATUS_CONFIG: Record<
  SurveyStatus,
  { label: string; classes: string }
> = {
  [SurveyStatus.ACTIVE]: {
    label: 'Activo',
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  [SurveyStatus.DRAFT]: {
    label: 'Borrador',
    classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  [SurveyStatus.INACTIVE]: {
    label: 'Inactivo',
    classes: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
};

interface BadgeProps {
  status: SurveyStatus;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};

export default Badge;
