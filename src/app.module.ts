
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.model';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { Imob, ImobSchema } from './imob/imob.model';
import { ImobsController } from './imob/imob.controller';
import { ImobsService } from './imob/imob.service';
import { DATABASE_URL } from "env";

console.log("data...", DATABASE_URL)

@Module({
  imports: [
    MongooseModule.forRoot(DATABASE_URL),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Imob.name, schema: ImobSchema }])
  ],
  controllers: [UsersController, ImobsController],
  providers: [UsersService, ImobsService],
})

export class AppModule { }