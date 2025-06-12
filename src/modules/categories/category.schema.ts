import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  _id?: Types.ObjectId;
  @Prop()
  name: string;

  @Prop()
  image: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
