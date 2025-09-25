import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { Response } from 'express'; // 👈 Importe o Response do express
import { Imob } from './imob.model';
import { ImobsService } from './imob.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
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

      @Get('export')
      @Roles(UserRole.ADMIN)
      @ApiOperation({ summary: 'Exportar todos os imoveis para uma planilha Excel' })
      async exportImobs(@Res() res: Response): Promise<void> {
        const fileBuffer = await this.imobsService.exportToExcel();
    
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="imoveis.xlsx"',
        });
    
        res.send(fileBuffer);
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

      @Post('import')
      @Roles(UserRole.ADMIN)
      @ApiOperation({ summary: 'Importar imoveis de uma planilha Excel' })
      @ApiConsumes('multipart/form-data')
      @ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      })
      @UseInterceptors(FileInterceptor('file'))
      async importUsers(
        @UploadedFile() file: Express.Multer.File,
      ): Promise<any> {
        if (!file) {
          throw new BadRequestException('Nenhum arquivo enviado.');
        }
        return this.imobsService.importFromExcel(file);
      }
}
