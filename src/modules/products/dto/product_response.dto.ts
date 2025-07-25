import { Product } from '../product.schema';
import * as dotenv from 'dotenv';
dotenv.config();
export class ProductResponseDto {
  id: string;
  name: string;
  categoryId: string | undefined;
  price: number | undefined;
  originalPrice: number | undefined;
  images: string[] | undefined;
  details: { title: string; content: string }[];
  sizes: string[];
  colors: { name: string | undefined; hex: string | undefined }[];

  constructor(product: Product) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    this.id = product._id?.toString()!;
    this.name = product.name;
    this.categoryId = product.categoryId?.toString();
    this.price = product.price;
    this.originalPrice = product.originalPrice;
    const BASE_URL = process.env.BASE_IMAGE_URL + 'public/image/';
    this.images = product.images.map((image) => {
      if (image && !image.startsWith('http')) {
        return BASE_URL + image;
      } else {
        return image;
      }
    });
    this.details = product.details!;
    this.sizes = product.sizes!;
    this.colors = product.colors!;
  }
}
