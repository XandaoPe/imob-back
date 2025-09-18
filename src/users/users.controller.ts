// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { User } from './user.model';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/roles.decorator'
import { UserRole } from './user.model';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
}