import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  _id?: Types.ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: string;

  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  originalPrice: number;

  @Prop()
  image: string;

  @Prop({
    type: [
      {
        title: { type: String },
        content: { type: String },
      },
    ],
    default: [],
  })
  details: { title: string; content: string }[];

  @Prop()
  sizes: string[];

  @Prop({
    type: [
      {
        name: { type: String },
        hex: { type: String },
      },
    ],
  })
  colors: { name: string; hex: string }[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
