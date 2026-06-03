import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subcategory } from '../subcategories/subcategory.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Roles (de gov-espacio-publico) que pueden ver/llenar los formularios de esta
  // categoría. null = visible para todos. [] = oculta para todos. [..] = allowlist.
  @Column({
    type: 'text',
    nullable: true,
    transformer: {
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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category, {
    cascade: true,
  })
  subcategories: Subcategory[];
}
