// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { User } from './user.model';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/roles.decorator'
import { UserRole } from './user.model';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // 🔥 NOVO ENDPOINT: Retorna todos os usuários (ativos e inativos)
  @Get('all')
  @Roles(UserRole.ADMIN) // Apenas administradores podem ver todos os usuários
  @ApiOperation({ summary: 'Listar todos os usuários, incluindo os inativos' })
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAllWithDisabled();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Alterar a senha do usuário' })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto
  ): Promise<User> {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar usuário' })
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }

  @Get('role/:role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Buscar usuários por perfil' })
  findByRole(@Param('role') role: UserRole): Promise<User[]> {
    return this.usersService.findByRole(role);
  }

  // 🔥 NOVA ROTA: Solicitar redefinição de senha
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha por e-mail' })
  // @UseGuards() ⚠️ Remova os guards de autenticação
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    console.log('forgotPasswordDto', forgotPasswordDto);
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  // 🔥 NOVA ROTA: Redefinir senha com token
  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com token recebido por e-mail' })
  // @UseGuards() ⚠️ Remova os guards de autenticação
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<User> {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  // 🔥 Nova rota para desativar o usuário
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar um usuário (soft delete)' })
  deactivate(@Param('id') id: string): Promise<User> {
    return this.usersService.deactivate(id);
  }

  // 🔥 NOVO ENDPOINT: Ativar um usuário
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ativar um usuário' })
  activate(@Param('id') id: string): Promise<User> {
    return this.usersService.activate(id);
  }

  // 📁 NOVO ENDPOINT: Importar usuários de um arquivo Excel
  @Post('import')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Importar usuários de uma planilha Excel' })
  @ApiConsumes('multipart/form-data') // 👈 Informa ao Swagger o tipo de dado
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // 👈 Descreve o campo como um arquivo binário
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
    return this.usersService.importFromExcel(file);
  }

}