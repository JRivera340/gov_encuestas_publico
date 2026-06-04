import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Roles que pueden ver/llenar los formularios de la categoría. Vacío/ausente = todos.
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  visibleRoles?: string[];
}
