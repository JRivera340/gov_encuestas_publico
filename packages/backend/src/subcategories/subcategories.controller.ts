import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException, Query } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly service: SubcategoriesService) {}

  @Get()
  findAll(@Query('categoryName') categoryName?: string) {
    return this.service.findAll(categoryName);
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

  @Post()
  create(@Body() dto: CreateSubcategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubcategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
