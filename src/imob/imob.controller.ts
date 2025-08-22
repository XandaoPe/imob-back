import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { Imob } from './imob.model';
import { ImobsService } from './imob.service';

@Controller('imobs')
export class ImobsController {
  constructor(private readonly imobsService: ImobsService) {}

  @Post()
  create(@Body() imob: Imob): Promise<Imob> {
    return this.imobsService.create(imob);
  }

  @Get()
  findAll(): Promise<Imob[]> {
    return this.imobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise <{data:Imob,message:string,status:number}> {
    return this.imobsService.findOne(id);
  }

  @Get('imagem/:id')
  findImage(@Param('id') id: string): Promise<Imob> {
    return this.imobsService.findImage(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() imob: Imob): Promise<Imob> {
    return this.imobsService.update(id, imob);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Imob> {
    return this.imobsService.remove(id);
  }
}
