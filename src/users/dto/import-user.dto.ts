import { IsString, IsEmail, IsArray, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { UserRole } from '../user.model';

export class ImportUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    cpf: string;

    @IsString()
    phone: string;

    @IsString()
    cargo: string;

    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];
}