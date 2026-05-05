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

  @Column({ type: 'text' })
  label: string;

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
  @Column({ type: 'text', nullable: true })
  options: string | null;
}
