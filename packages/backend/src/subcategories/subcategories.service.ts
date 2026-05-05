import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './subcategory.entity';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly repo: Repository<Subcategory>,
  ) {}

  findAll(): Promise<Subcategory[]> {
    return this.repo.find({ relations: ['category'] });
  }

  findOne(id: string): Promise<Subcategory | null> {
    return this.repo.findOne({ where: { id }, relations: ['category'] });
  }

  async findByCategory(categoryId: string): Promise<Subcategory[]> {
    return this.repo.find({
      where: { categoryId },
      relations: ['category'],
    });
  }

  async findOneOrFail(id: string): Promise<Subcategory> {
    const sub = await this.findOne(id);
    if (!sub) throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    return sub;
  }
}
