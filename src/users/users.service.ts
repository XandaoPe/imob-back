// src/users/users.service.ts
import { BadRequestException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name)
  private userModel: Model<User>,
    private emailService: EmailService,
  ) { }

  async onModuleInit() {
    await this.hashExistingPasswords(); // ← Corrige senhas existentes
    await this.createAdminUser();
  }

  // 🔥 NOVO MÉTODO: Hashea todas as senhas em texto puro
  async hashExistingPasswords() {
    try {
      const usersWithPlainPassword = await this.userModel.find({
        $or: [
          { password: { $regex: /^[a-zA-Z0-9]+$/ } }, // Senhas sem caracteres especiais de hash
          { password: { $not: { $regex: /^\$2[aby]\$/ } } } // Não começa com padrão bcrypt
        ]
      });

      for (const user of usersWithPlainPassword) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await this.userModel.findByIdAndUpdate(user._id, {
          password: hashedPassword
        });
        console.log(`✅ Senha hasheada para usuário: ${user.email}`);
      }
    } catch (error) {
      console.error('❌ Erro ao hashear senhas existentes:', error);
    }
  }

  async createAdminUser() {
    try {
      const adminExists = await this.userModel.findOne({
        email: 'admin@admin.com'
      });

      if (!adminExists) {
        const adminUser = {
          name: 'admin',
          email: 'admin@admin.com',
          password: await bcrypt.hash('admin', 10),
          roles: [UserRole.ADMIN]
        };

        await this.userModel.create(adminUser);
        console.log('✅ Usuário admin criado: admin@admin.com / admin123');
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário admin:', error);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword, // ← SEMPRE hasheie a senha
      roles: createUserDto.roles || [UserRole.USER]
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<User> {
    // 1. Encontre o usuário, incluindo a senha
    const user = await this.userModel.findById(id).select('+password').exec();

    // 2. Verifique se o usuário existe
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // 3. Valide a senha atual
    const isPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    // 4. Hasheie a nova senha
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    // 5. Atualize a senha e salve
    user.password = hashedPassword;
    await user.save();

    // 6. Retorne o usuário sem a senha
    return this.userModel.findById(id).select('-password').exec();
  }


  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ roles: role }).select('-password').exec();
  }

  // 🔥 NOVO MÉTODO: Solicitação de "esqueci a senha"
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email }).exec();
    if (!user) {
      // Por segurança, retorne sem erro.
      return;
    }

    // GERA UM CÓDIGO DE 6 DÍGITOS
    const passwordResetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

    user.passwordResetCode = passwordResetCode; // 👈 Salva o código
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Chame o serviço de e-mail e envie o código, não um link
    console.log('Código gerado:', passwordResetCode);
    await this.emailService.sendPasswordResetCode(user.email, passwordResetCode);
  }

  // 🔥 NOVO MÉTODO: Redefinir a senha com o código
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    const { email, code, newPassword } = resetPasswordDto;

    const user = await this.userModel.findOne({
      email, // 👈 Busca pelo email
      passwordResetCode: code, // 👈 Compara o código
      resetPasswordExpires: { $gt: new Date() }, // 👈 Verifica se não expirou
    }).select('+password').exec();

    if (!user) {
      throw new BadRequestException('Código de redefinição inválido ou expirado.');
    }

    // Atualiza a senha
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = undefined; // Limpa o código
    user.resetPasswordExpires = undefined; // Limpa a data de expiração
    await user.save();

    // Retorna o usuário sem a senha
    return this.userModel.findById(user._id).select('-password').exec();
  }
}