import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Subcategory } from '../subcategories/subcategory.entity';

const SEED_DATA = [
  {
    name: 'IVC',
    description: 'Inspección, Vigilancia y Control',
    subcategories: [
      { name: 'Establecimiento de comercio', description: 'Inspección de establecimientos comerciales' },
      { name: 'Estacionamiento', description: 'Control de zonas de estacionamiento' },
      { name: 'Parqueadero', description: 'Vigilancia de parqueaderos' },
    ],
  },
  {
    name: 'ESPACIO_PUBLICO',
    description: 'Gestión y control del espacio público',
    subcategories: [
      { name: '1801', description: 'Formulario de espacio público 1801' },
    ],
  },
  {
    name: 'AMBIENTAL',
    description: 'Gestión ambiental y de residuos',
    subcategories: [
      { name: 'Ambiente', description: 'Inspección ambiental general' },
      { name: 'Manejo de Residuos', description: 'Control del manejo de residuos sólidos' },
    ],
  },
];

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoriesRepo: Repository<Subcategory>,
  ) {}

  async run(): Promise<{ message: string; created: number }> {
    let created = 0;

    for (const data of SEED_DATA) {
      let category = await this.categoriesRepo.findOne({
        where: { name: data.name },
      });

      if (!category) {
        category = await this.categoriesRepo.save(
          this.categoriesRepo.create({ name: data.name, description: data.description }),
        );
        created++;
      }

      for (const sub of data.subcategories) {
        const exists = await this.subcategoriesRepo.findOne({
          where: { name: sub.name, categoryId: category.id },
        });
        if (!exists) {
          await this.subcategoriesRepo.save(
            this.subcategoriesRepo.create({
              name: sub.name,
              description: sub.description,
              categoryId: category.id,
            }),
          );
          created++;
        }
      }
    }

    return {
      message: 'Seed ejecutado correctamente',
      created,
    };
  }
}
