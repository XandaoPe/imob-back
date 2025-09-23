// src/users/users.service.ts
import { BadRequestException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';
import * as xlsx from 'xlsx';
@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name)
  private userModel: Model<User>,
    private emailService: EmailService,
  ) { }

  async onModuleInit() {
    await this.hashExistingPasswords();
    await this.createAdminUser();
  }

  async hashExistingPasswords() {
    try {
      const usersWithPlainPassword = await this.userModel.find({
        $or: [
          { password: { $regex: /^[a-zA-Z0-9]+$/ } },
          { password: { $not: { $regex: /^\$2[aby]\$/ } } }
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
          roles: [UserRole.ADMIN],
          cargo: 'Administrador',
          cpf: '000.000.000-00',
          phone: '00000-0000',
          isDisabled: false,
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
      password: hashedPassword,
      roles: createUserDto.roles || [UserRole.USER],
      isDisabled: false,

    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isDisabled: false }).select('-password').exec();
  }

  async findAllWithDisabled(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id, isDisabled: false }).select('-password').exec();
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
    const user = await this.userModel.findById(id).select('+password').exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const isPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await user.save();
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email }).exec();
    if (!user) {
      return;
    }
    const passwordResetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordExpires = new Date(Date.now() + 3600000);
    user.passwordResetCode = passwordResetCode;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();
    console.log('Código gerado:', passwordResetCode);
    await this.emailService.sendPasswordResetCode(user.email, passwordResetCode);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<User> {
    const { email, code, newPassword } = resetPasswordDto;
    const user = await this.userModel.findOne({
      email,
      passwordResetCode: code,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password').exec();

    if (!user) {
      throw new BadRequestException('Código de redefinição inválido ou expirado.');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return this.userModel.findById(user._id).select('-password').exec();
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isDisabled: true },
      { new: true }
    ).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async activate(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isDisabled: false },
      { new: true }
    ).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async importFromExcel(file: Express.Multer.File): Promise<any> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const usersData = xlsx.utils.sheet_to_json(worksheet);

      const importSummary = {
        created: 0,
        updated: 0,
        ignored: 0,
        details: []
      };

      for (const userData of usersData) {
        const { name, email, password, cpf, phone, cargo, roles } = userData as any;

        if (!email) {
          console.error(`❌ Ignorando linha com e-mail ausente: ${JSON.stringify(userData)}`);
          importSummary.ignored++;
          importSummary.details.push({ data: userData, status: 'Ignorado', reason: 'E-mail ausente' });
          continue;
        }

        const existingUser = await this.userModel.findOne({ email }).exec();
        const userPayload: any = {
          name,
          email,
          cpf,
          phone,
          cargo,
          roles: roles ? roles.split(',').map((role: string) => role.trim()) : [UserRole.USER],
          isDisabled: false, // <-- Lógica para ativar usuários existentes
        };

        if (password) {
          userPayload.password = await bcrypt.hash(password, 10);
        }

        if (existingUser) {
          const updatedUser = await this.userModel.findByIdAndUpdate(
            existingUser._id,
            { $set: userPayload },
            { new: true }
          ).exec();
          if (updatedUser) {
            importSummary.updated++;
            importSummary.details.push({ email, status: 'Atualizado (ativado)' });
          } else {
            importSummary.ignored++;
            importSummary.details.push({ email, status: 'Erro', reason: 'Falha na atualização' });
          }
        } else {
          if (!password) {
            console.error(`❌ Ignorando novo usuário sem senha: ${email}`);
            importSummary.ignored++;
            importSummary.details.push({ email, status: 'Ignorado', reason: 'Senha ausente para novo usuário' });
            continue;
          }
          const newUser = new this.userModel({
            ...userPayload,
            password: await bcrypt.hash(password, 10),
            isDisabled: false, // <-- Lógica para ativar novos usuários
          });
          await newUser.save();
          importSummary.created++;
          importSummary.details.push({ email, status: 'Criado (ativado)' });
        }
      }

      return {
        message: `Importação concluída. ${importSummary.created} criados e ${importSummary.updated} atualizados.`,
        ...importSummary,
      };
    } catch (error) {
      console.error('❌ Erro na importação:', error);
      throw new BadRequestException('Erro ao processar a planilha. Verifique o formato do arquivo e os cabeçalhos das colunas (name, email, password, cpf, phone, cargo, roles).');
    }
  }
}