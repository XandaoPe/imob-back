import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Imob extends Document {

  @Prop({
    type: String,
    enum: [
      '01',
      '02',
      '03',
      'República Masculina 01',
      'República Masculina 02',
      'República Masculina 03',
      'República Feminina 01',
      'República Feminina 02',
      'República Feminina 03',
    ],
  })
  tipo: string;

  @Prop()
  rua: string;

  @Prop()
  numero: string;

  @Prop()
  complemento: string;

  @Prop()
  cep: string;

  @Prop()
  cidade: string;

  @Prop()
  uf: string;

  @Prop()
  obs: string;

  @Prop()
  copasa: string;

  @Prop()
  cemig: string;

  @Prop({ default: false })
  isDisabled: boolean;

  @Prop()
  id_user: string;

}

export const ImobSchema = SchemaFactory.createForClass(Imob);
