import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Survey } from '../surveys/survey.entity';

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

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  survey: Survey;

  @Column()
  surveyId: string;

  @Column({ type: 'text' })
  type: QuestionType;

  /**
   * Identificador técnico del campo (ej: 'cant_personas', 'foto_evidencia')
   * Útil para que el proyecto externo sepa cómo mapear la respuesta.
   */
  @Column({ nullable: true })
  name: string; // Nombre técnico (ej: licores_adulterados) para integraciones

  @Column({ type: 'text' })
  label: string;

  @Column({ default: false })
  isMetric: boolean; // Indica si este campo es vital para los dashboards

  @Column({ type: 'text', nullable: true })
  placeholder: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: 0 })
  order: number;

  /**
   * JSON string – used for SELECT, MULTISELECT, RADIO, CHECKBOX
   * Format: [{ label: string; value: string }]
   */
  @Column({ type: 'jsonb', nullable: true })
  options: any;

  /**
   * Configuración adicional en formato JSON (ej: límites de archivos, validaciones, etc.)
   */
  @Column({ type: 'jsonb', nullable: true })
  config: any;
}
