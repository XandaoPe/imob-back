import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Questionnaire extends Document {
  @Prop()
  question: string;

}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
