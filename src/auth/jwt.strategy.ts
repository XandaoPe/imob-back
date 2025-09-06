// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'xandaope',
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findOneByEmail(payload.email);
        if (!user) {
            return null;
        }

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            roles: user.roles
        };
    }
}