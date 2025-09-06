// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { UserRole } from '../user.model';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ enum: UserRole, isArray: true, required: false })
    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];

    @ApiProperty()
    @IsNotEmpty()
    cpf: string;

    @ApiProperty()
    @IsNotEmpty()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    cargo: string;

}
