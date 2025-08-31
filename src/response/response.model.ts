// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema()
// export class Response extends Document {
//   @Prop()
//   questionresponse: string;

//   @Prop()
//   id_question: string;

// }

// export const ResponseSchema = SchemaFactory.createForClass(Response);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Questionnaire } from '../questionnaire/questionnaire.model';

@Schema()
export class Response extends Document {
  @Prop()
  questionresponse: string;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Questionnaire" })
  id_question: MongooseSchema.Types.ObjectId;

  // @Prop()
  // isDeleted: boolean;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);