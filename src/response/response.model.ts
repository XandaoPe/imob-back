import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Response extends Document {
  @Prop()
  questionresponse: string;

  @Prop()
  id_question: string;

}

export const ResponseSchema = SchemaFactory.createForClass(Response);
