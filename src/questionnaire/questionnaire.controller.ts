import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { Questionnaire } from './questionnaire.model';
import { QuestionnairesService } from './questionnaire.service';

@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  create(@Body() questionnaire: Questionnaire): Promise<Questionnaire> {
    return this.questionnairesService.create(questionnaire);
  }

  @Get()
  findAll(): Promise<Questionnaire[]> {
    return this.questionnairesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Questionnaire> {
    return this.questionnairesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() questionnaire: Questionnaire): Promise<Questionnaire> {
    return this.questionnairesService.update(id, questionnaire);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Questionnaire> {
    return this.questionnairesService.remove(id);
  }
}
