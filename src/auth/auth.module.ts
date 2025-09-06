// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        PassportModule,
        JwtModule.register({
            secret: 'xandaope',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [AuthService, JwtStrategy, UsersService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }