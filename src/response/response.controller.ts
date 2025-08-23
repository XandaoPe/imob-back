import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { Response } from './response.model';
import { ResponsesService } from './response.service';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  create(@Body() response: Response): Promise<Response> {
    return this.responsesService.create(response);
  }

  @Get()
  findAll(): Promise<Response[]> {
    return this.responsesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Response> {
    return this.responsesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() response: Response): Promise<Response> {
    return this.responsesService.update(id, response);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Response> {
    return this.responsesService.remove(id);
  }
}
