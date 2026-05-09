import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly repo: Repository<Subcategory>,
  ) {}

  findAll(): Promise<Subcategory[]> {
    return this.repo.find({ 
      relations: ['category'],
      order: { name: 'ASC' }
    });
  }

  findOne(id: string): Promise<Subcategory | null> {
    return this.repo.findOne({ where: { id }, relations: ['category'] });
  }

  async findByCategory(categoryId: string): Promise<Subcategory[]> {
    return this.repo.find({
      where: { categoryId },
      relations: ['category'],
      order: { name: 'ASC' }
    });
  }

  async findOneOrFail(id: string): Promise<Subcategory> {
    const sub = await this.findOne(id);
    if (!sub) throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    return sub;
  }

  async create(dto: CreateSubcategoryDto): Promise<Subcategory> {
    const existing = await this.repo.findOne({ 
      where: { name: dto.name, categoryId: dto.categoryId } 
    });
    if (existing) {
      throw new ConflictException(`La subcategoría '${dto.name}' ya existe en esta categoría`);
    }
    const sub = this.repo.create(dto);
    return this.repo.save(sub);
  }

  async update(id: string, dto: UpdateSubcategoryDto): Promise<Subcategory> {
    const sub = await this.findOneOrFail(id);
    Object.assign(sub, dto);
    return this.repo.save(sub);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
