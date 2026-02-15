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

  @Prop({ required: true })
  name: string;

  @Prop()
  price: number;

  @Prop()
  originalPrice: number;

  @Prop({ type: [String], default: [] })
  images: string[];

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

  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({
    type: [
      {
        name: { type: String },
        hex: { type: String },
      },
    ],
    default: [],
  })
  colors: { name: string; hex: string }[];

  @Prop({ type: Boolean, default: false })
  hasVariants: boolean;

  @Prop({
    type: [
      {
        name: { type: String },
        values: { type: [String], default: [] },
      },
    ],
    default: [],
  })
  variantOptions: { name: string; values: string[] }[];

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brandId?: string;

  @Prop()
  sizeGuide?: string;

  @Prop({ type: Number, default: 0 })
  soldCount: number;

  @Prop()
  sku?: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
