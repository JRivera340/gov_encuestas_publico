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

  // Roles (de gov-espacio-publico) que pueden ver/llenar este formulario.
  // null o arreglo vacío = visible para todos los roles (retrocompatibilidad).
  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      // null/undefined => visible para todos. Arreglo (incluido vacío) => allowlist
      // explícita; el vacío significa "oculto para todos".
      to: (value: any) => (value == null ? null : JSON.stringify(value)),
      from: (value: any) => {
        if (value == null) return null;
        try {
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return null;
        }
      },
    },
  })
  visibleRoles: string[] | null;

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
