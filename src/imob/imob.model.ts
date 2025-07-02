import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Imob extends Document {

  @Prop()
  thumb: string;

  @Prop()
  tipo: string;

  @Prop()
  endereco: string;

  @Prop()
  cidade: string;

  @Prop()
  uf: string;

  @Prop()
  valor: string;

  @Prop()
  descricao: string;

  @Prop()
  id_user: string;

}

export const ImobSchema = SchemaFactory.createForClass(Imob);
