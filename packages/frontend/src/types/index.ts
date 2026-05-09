// ─── Enums ────────────────────────────────────────────────────────────────────

export enum SurveyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export enum QuestionType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  TEXTAREA = 'TEXTAREA',
  FILE = 'FILE',
  LOCATION = 'LOCATION',
  SECTION_HEADER = 'SECTION_HEADER',
  ENTITY_SELECT = 'ENTITY_SELECT',
}

// ─── Domain interfaces ────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  surveyId: string;
  type: QuestionType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options: string | null; // JSON string
  config: string | null;  // JSON string
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  status: SurveyStatus;
  version: number;
  subcategoryId: string;
  subcategory?: Subcategory & { category?: Category };
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

// ─── DTO shapes ───────────────────────────────────────────────────────────────

export interface CreateSurveyPayload {
  title: string;
  description?: string;
  status?: SurveyStatus;
  subcategoryId: string;
}

export interface UpdateSurveyPayload extends Partial<CreateSurveyPayload> {}

export interface CreateQuestionPayload {
  type: QuestionType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  order?: number;
  options?: QuestionOption[];
  config?: Record<string, any>;
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const parseOptions = (raw: string | null): QuestionOption[] => {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QuestionOption[];
  } catch {
    return [];
  }
};

export const parseConfig = (raw: string | null): Record<string, any> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, any>;
  } catch {
    return {};
  }
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.TEXT]: 'Texto corto',
  [QuestionType.TEXTAREA]: 'Texto largo',
  [QuestionType.NUMBER]: 'Número',
  [QuestionType.DATE]: 'Fecha',
  [QuestionType.SELECT]: 'Lista desplegable',
  [QuestionType.MULTISELECT]: 'Selección múltiple',
  [QuestionType.RADIO]: 'Opción única (radio)',
  [QuestionType.CHECKBOX]: 'Casillas de verificación',
  [QuestionType.FILE]: 'Archivo (Imagen/PDF)',
  [QuestionType.LOCATION]: 'Ubicación (Mapa)',
  [QuestionType.SECTION_HEADER]: 'Encabezado de Sección',
  [QuestionType.ENTITY_SELECT]: 'Selector de Entidades',
};

export const CATEGORY_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  IVC: { bg: 'from-amber-500/20 to-orange-600/10', accent: 'bg-amber-500', text: 'text-amber-400' },
  ESPACIO_PUBLICO: { bg: 'from-blue-500/20 to-indigo-600/10', accent: 'bg-blue-500', text: 'text-blue-400' },
  AMBIENTAL: { bg: 'from-emerald-500/20 to-teal-600/10', accent: 'bg-emerald-500', text: 'text-emerald-400' },
};

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  IVC: 'IVC',
  ESPACIO_PUBLICO: 'Espacio Público',
  AMBIENTAL: 'Ambiental',
};
