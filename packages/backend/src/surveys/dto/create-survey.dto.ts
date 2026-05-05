import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SurveyStatus } from '../survey.entity';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SurveyStatus)
  @IsOptional()
  status?: SurveyStatus;

  @IsNumber()
  @IsOptional()
  version?: number;

  @IsString()
  @IsNotEmpty()
  subcategoryId: string;
}
