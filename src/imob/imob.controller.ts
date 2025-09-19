import { Controller, Get, Post, Body, Param, Put, Delete, Patch } from '@nestjs/common';
import { Imob } from './imob.model';
import { ImobsService } from './imob.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.model';

@ApiTags('imobs')
@ApiBearerAuth('access-token')
@Controller('imobs')

export class ImobsController {
  constructor(private readonly imobsService: ImobsService) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo imóvel' })
  create(@Body() imob: Imob): Promise<Imob> {
    return this.imobsService.create(imob);
  }

  @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Listar todos os imóveis' })
    findAll(): Promise<Imob[]> {
    return this.imobsService.findAll();
  }

   @Get('all')
    @Roles(UserRole.ADMIN) // Apenas administradores podem ver todos os imóveis
    @ApiOperation({ summary: 'Listar todos os imóveis, incluindo os inativos' })
    findAllImobs(): Promise<Imob[]> {
      return this.imobsService.findAllWithDisabled();
    }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar imóvel por ID' })
  findOne(@Param('id') id: string): Promise<{ data: Imob, message: string, status: number }> {
    return this.imobsService.findOne(id);
  }

  @Put(':id')
    @ApiOperation({ summary: 'Atualizar imóvel' })
  update(@Param('id') id: string, @Body() imob: Imob): Promise<Imob> {
    return this.imobsService.update(id, imob);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Imob> {
    return this.imobsService.remove(id);
  }

    // 🔥 Nova rota para desativar o usuário
    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Desativar um imóvel (soft delete)' })
    deactivate(@Param('id') id: string): Promise<Imob> {
      return this.imobsService.deactivate(id);
    }
  
    // 🔥 NOVO ENDPOINT: Ativar um usuário
    @Patch(':id/activate')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Ativar um imóvel' })
    activate(@Param('id') id: string): Promise<Imob> {
      return this.imobsService.activate(id);
    }

}
