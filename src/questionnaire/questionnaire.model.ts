import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Questionnaire extends Document {

  @Prop()
  question: string;

  @Prop({ default: false })
  isDeleted: boolean;

}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
