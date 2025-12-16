import { join } from 'path';
import { Product } from '../product.schema';
import * as dotenv from 'dotenv';
import { ProductDetailDto } from './product_detail.dto';

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
  colors: { name: string; hex: string }[];
  hasVariants: boolean;
  brandId?: string;
  sizeGuide?: string;
  variants?: ProductDetailDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(product: Product, variants?: ProductDetailDto[]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    this.id = product._id?.toString()!;
    this.name = product.name;
    this.categoryId = product.categoryId?.toString();
    this.price = product.price;
    this.originalPrice = product.originalPrice;
    this.images = product.images?.map((image) => {
      if (image && !image.startsWith('http')) {
        return process.env.BASE_IMAGE_URL + 'image/' + image;
      } else {
        return image;
      }
    });
    this.details = product.details || [];
    this.sizes = product.sizes || [];
    this.colors = product.colors || [];
    this.hasVariants = product.hasVariants;
    this.brandId = product.brandId;
    this.sizeGuide = product.sizeGuide;
    if (this.sizeGuide && !this.sizeGuide.startsWith('http')) {
      this.sizeGuide = process.env.BASE_IMAGE_URL + 'image/' + this.sizeGuide;
    }
    variants?.map((variant)=>{
      if (variant.variationImage && !variant.variationImage.startsWith('http')) {
        variant.variationImage = process.env.BASE_IMAGE_URL + 'image/' + variant.variationImage;
      }
    });
    this.variants = variants;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
