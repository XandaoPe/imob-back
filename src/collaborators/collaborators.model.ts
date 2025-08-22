import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Collaborator extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;
  
  @Prop()
  phone: string;
 
}

export const CollaboratorSchema = SchemaFactory.createForClass(Collaborator);
