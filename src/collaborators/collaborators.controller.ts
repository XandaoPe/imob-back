import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { Collaborator } from './collaborators.model';
import { CollaboratorsService } from './collaborators.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth('access-token')
@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}
  @UseGuards(AuthGuard('jwt')) 

  @Post()
  create(@Body() collaborator: Collaborator): Promise<Collaborator> {
    console.log('payload controller...', collaborator)
    return this.collaboratorsService.create(collaborator);
  }

  @Get()
  findAll(): Promise<Collaborator[]> {
    return this.collaboratorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Collaborator> {
    return this.collaboratorsService.findOne(id);
  }

  @Get('imagem/:id')
  findImage(@Param('id') id: string): Promise<Collaborator> {
    return this.collaboratorsService.findImage(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() collaborator: Collaborator): Promise<Collaborator> {
    return this.collaboratorsService.update(id, collaborator);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Collaborator> {
    return this.collaboratorsService.remove(id);
  }
}
