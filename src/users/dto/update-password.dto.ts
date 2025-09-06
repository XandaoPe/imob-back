// src/users/dto/update-password.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
    @ApiProperty({ description: 'A senha atual do usuário' })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({ description: 'A nova senha do usuário' })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}