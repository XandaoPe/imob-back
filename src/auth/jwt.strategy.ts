import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'xandaope', // Use a mesma chave que usou no AuthModule
        });
    }

    async validate(payload: any) {
        // Este payload vem do token. Você pode usá-lo para encontrar o utilizador.
        // Lembre-se de não retornar a senha.
        const user = await this.usersService.findOneByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
