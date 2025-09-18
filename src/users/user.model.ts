// src/users/user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR'
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.USER]
  })
  roles: UserRole[];

  @Prop({ required: true })
  cpf: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  cargo: string;

  @Prop({ select: false })
  passwordResetCode: string;

  @Prop({ select: false })
  resetPasswordExpires: Date;

  // 👈 Adicione a propriedade para desabilitar o usuário
  @Prop({ default: false })
  isDisabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);