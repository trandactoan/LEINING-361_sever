import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ collection: 'banners', timestamps: true })
export class Banner {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop()
  link?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
