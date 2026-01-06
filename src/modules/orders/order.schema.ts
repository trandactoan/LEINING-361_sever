import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type OrderDocument = Order & Document;

@Schema({
    collection: 'orders',
    timestamps: true
})
export class Order {
    _id?: Types.ObjectId;

    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    address: string;

    @Prop({
        type: [
            {
                productId: { type: Types.ObjectId, ref: 'Product', required: true },
                productName: { type: String, required: true },
                variantId: { type: Types.ObjectId, ref: 'ProductDetail', required: false },
                variantAttributes: {
                    type: [
                        {
                            name: { type: String },
                            value: { type: String },
                        }
                    ],
                    required: false
                },
                price: { type: Number, required: true },
                originalPrice: { type: Number, required: false },
                quantity: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                image: { type: String, required: false },
                sku: { type: String, required: false },
            }
        ],
        required: true
    })
    items: {
        productId: Types.ObjectId;
        productName: string;
        variantId?: Types.ObjectId;
        variantAttributes?: { name: string; value: string }[];
        price: number;
        originalPrice?: number;
        quantity: number;
        subtotal: number;
        image?: string;
        sku?: string;
    }[];

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true })
    totalItems: number;

    @Prop({
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    })
    status: string;

    @Prop({ required: false })
    checkoutSdkOrderId?: string;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop({ default: new Date() })
    updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
