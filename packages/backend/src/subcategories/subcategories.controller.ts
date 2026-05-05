import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly service: SubcategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.service.findByCategory(categoryId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sub = await this.service.findOne(id);
    if (!sub) throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    return sub;
  }
}
