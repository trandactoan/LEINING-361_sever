import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TokenDocument = Token & Document;
@Schema()
export class Token {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;

  @Prop()
  token: string;

  @Prop()
  expiredDate: number;
}
export const TokenSchema = SchemaFactory.createForClass(Token);
