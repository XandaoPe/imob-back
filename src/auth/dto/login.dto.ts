import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @IsEmail()
    @ApiProperty({ description: 'O endereço de email do utilizador.' })
    email: string;

    @IsString()
    @ApiProperty({ description: 'A senha do utilizador.' })
    password: string;
}
