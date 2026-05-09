import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { QuestionType } from '../question.entity';

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  /**
   * For SELECT, MULTISELECT, RADIO, CHECKBOX.
   * Array of { label: string; value: string }
   */
  @IsArray()
  @IsOptional()
  options?: { label: string; value: string }[];

  /**
   * Additional configuration for the question (e.g. file limits, map settings)
   */
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
