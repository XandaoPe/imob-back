// src/users/users.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

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

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ roles: role }).select('-password').exec();
  }

}