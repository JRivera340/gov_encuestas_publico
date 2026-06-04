import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Survey } from '../surveys/survey.entity';

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Clave estable / contrato con gov-espacio-publico (mapeo a OperativoSubtipo).
  @Column({ type: 'text' })
  name: string;

  // Nombre visible editable. Si es null, se usa `name`. No afecta el contrato.
  @Column({ type: 'text', nullable: true })
  displayName: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: 'CASCADE',
  })
  category: Category;

  @Column()
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Survey, (survey) => survey.subcategory)
  surveys: Survey[];
}
