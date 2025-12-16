import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document, Collection } from "mongoose";

export type ProductDetailDocument = ProductDetail & Document;

@Schema({
    collection: 'productDetails'
})
export class ProductDetail{
    _id?: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({
        type: [
            {
                name: { type: String },
                value: { type: String },
            }
        ],
        required: true
    })
    attributes: { name: string; value: string }[];

    @Prop({ required: true })
    price: number;

    @Prop({ required: false })
    originalPrice?: number;

    @Prop({ required: true })
    stock: number;

    @Prop({ required: true })
    sku: string;

    @Prop({ required: false })
    variationImage?: string;

    @Prop({ default: new Date() })
    createdAt: Date;
}

export const ProductDetailSchema = SchemaFactory.createForClass(ProductDetail);