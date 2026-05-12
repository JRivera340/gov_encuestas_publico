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

// Traductor automático de JSON a Texto
const jsonTransformer = {
  to: (value: any) => (value ? JSON.stringify(value) : null),
  from: (value: any) => {
    if (!value) return null;
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  },
};

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

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text' })
  label: string;

  @Column({ default: false })
  isMetric: boolean;

  @Column({ type: 'text', nullable: true })
  placeholder: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({ type: 'text', nullable: true, transformer: jsonTransformer })
  options: any;

  @Column({ type: 'text', nullable: true, transformer: jsonTransformer })
  config: any;
}
