// src/users/dto/reset-password.dto.ts
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
    email: string;

    @IsString({ message: 'O código deve ser uma string.' })
    @IsNotEmpty({ message: 'O código é obrigatório.' })
    code: string;

    @IsString({ message: 'A nova senha deve ser uma string.' })
    @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
    @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres.' })
    newPassword: string;
}