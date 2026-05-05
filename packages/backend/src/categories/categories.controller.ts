import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.service.findOne(id);
    if (!category) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    return category;
  }
}
