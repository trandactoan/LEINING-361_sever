import { Order } from '../order.schema';

export class OrderResponseDto {
    id: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    items: {
        productId: string;
        productName: string;
        variantId?: string;
        variantAttributes?: { name: string; value: string }[];
        price: number;
        originalPrice?: number;
        quantity: number;
        subtotal: number;
        image?: string;
        sku?: string;
    }[];
    totalAmount: number;
    totalItems: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(order: Order) {
        this.id = order._id?.toString()!;
        this.fullName = order.fullName;
        this.phoneNumber = order.phoneNumber;
        this.address = order.address;
        this.items = order.items.map(item => ({
            productId: item.productId.toString(),
            productName: item.productName,
            variantId: item.variantId?.toString(),
            variantAttributes: item.variantAttributes,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
            image: item.image,
            sku: item.sku,
        }));
        this.totalAmount = order.totalAmount;
        this.totalItems = order.totalItems;
        this.status = order.status;
        this.createdAt = order.createdAt;
        this.updatedAt = order.updatedAt;
    }
}
