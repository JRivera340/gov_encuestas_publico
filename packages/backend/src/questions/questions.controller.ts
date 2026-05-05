import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller()
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get('surveys/:surveyId/questions')
  findBySurvey(@Param('surveyId') surveyId: string) {
    return this.service.findBySurvey(surveyId);
  }

  @Post('surveys/:surveyId/questions')
  create(
    @Param('surveyId') surveyId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.service.create(surveyId, dto);
  }

  @Patch('questions/:id')
  update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.service.update(id, dto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch('surveys/:surveyId/questions/reorder')
  reorder(
    @Param('surveyId') surveyId: string,
    @Body('orderedIds') orderedIds: string[],
  ) {
    return this.service.reorder(surveyId, orderedIds);
  }
}
