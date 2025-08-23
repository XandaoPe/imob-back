
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.model';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { Imob, ImobSchema } from './imob/imob.model';
import { ImobsController } from './imob/imob.controller';
import { ImobsService } from './imob/imob.service';
// import { DATABASE_URL } from "env";
import { CollaboratorsController } from './collaborators/collaborators.controller';
import { CollaboratorsService } from './collaborators/collaborators.service';
import { Collaborator, CollaboratorSchema } from './collaborators/collaborators.model';
import { Questionnaire, QuestionnaireSchema } from './questionnaire/questionnaire.model';
import { QuestionnairesController } from './questionnaire/questionnaire.controller';
import { QuestionnairesService } from './questionnaire/questionnaire.service';
import { Response, ResponseSchema } from './response/response.model';
import { ResponsesController } from './response/response.controller';
import { ResponsesService } from './response/response.service';

const PORT = 5000;
const DATABASE_URL = 'mongodb+srv://alexandredellanno:Xela-2208@cluster0.gaixo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
@Module({
  imports: [
    MongooseModule.forRoot(DATABASE_URL),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Imob.name, schema: ImobSchema }]),
    MongooseModule.forFeature([{ name: Collaborator.name, schema: CollaboratorSchema }]),
    MongooseModule.forFeature([{ name: Questionnaire.name, schema: QuestionnaireSchema }]),
    MongooseModule.forFeature([{ name: Response.name, schema: ResponseSchema }])
  ],
  controllers: [UsersController, ImobsController, CollaboratorsController, QuestionnairesController, ResponsesController ],
  providers: [UsersService, ImobsService, CollaboratorsService, QuestionnairesService, ResponsesService],
})

export class AppModule { }