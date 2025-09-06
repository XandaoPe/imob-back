// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Email não encontrado');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Senha incorreta');
        }

        const { password: _, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user._id,
            roles: user.roles
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                roles: user.roles
            }
        };
    }
}