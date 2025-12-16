import { ProductDetail } from "../product_detail.schema";

export class ProductDetailDto {
    id: string;
    productId: string;
    attributes: { name: string; value: string }[];
    price: number;
    originalPrice?: number;
    stock: number;
    sku: string;
    variationImage?: string;
    createdAt: Date;

    constructor(data: ProductDetail) {
        this.id = data._id?.toString()!;
        this.productId = data.productId.toString();
        this.attributes = data.attributes;
        this.price = data.price;
        this.originalPrice = data.originalPrice;
        this.stock = data.stock;
        this.sku = data.sku;
        this.variationImage = data.variationImage;
        this.createdAt = data.createdAt;
    }
}