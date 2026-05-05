import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subcategory } from '../subcategories/subcategory.entity';
import { Question } from '../questions/question.entity';

export enum SurveyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', default: SurveyStatus.DRAFT })
  status: SurveyStatus;

  @Column({ default: 1 })
  version: number;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.surveys, {
    onDelete: 'CASCADE',
  })
  subcategory: Subcategory;

  @Column()
  subcategoryId: string;

  @OneToMany(() => Question, (question) => question.survey, {
    cascade: true,
    eager: true,
  })
  questions: Question[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
