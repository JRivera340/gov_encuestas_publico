import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.repo.find({ relations: ['subcategories'] });
  }

  findOne(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id }, relations: ['subcategories'] });
  }
}
