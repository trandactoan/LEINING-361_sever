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
  variantOptions?: { name: string; values: string[] }[];
  brandId?: string;
  sizeGuide?: string;
  soldCount: number;
  sku?: string;
  comments: { userName: string; avatar?: string; rating: number; content: string; photos: string[] }[];
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
    this.variantOptions = product.variantOptions;
    this.brandId = product.brandId;
    this.sizeGuide = product.sizeGuide;
    if (this.sizeGuide && !this.sizeGuide.startsWith('http')) {
      this.sizeGuide = process.env.BASE_IMAGE_URL + 'image/' + this.sizeGuide;
    }
    this.soldCount = product.soldCount || 0;
    this.sku = product.sku;
    this.comments = (product.comments || [])
      .filter((c) => c.userName && c.content)
      .map((c) => ({
        userName: c.userName,
        rating: c.rating ?? 5,
        content: c.content,
        avatar: c.avatar
          ? c.avatar.startsWith('http') ? c.avatar : process.env.BASE_IMAGE_URL + 'image/' + c.avatar
          : undefined,
        photos: (c.photos || [])
          .filter((p) => p && !p.startsWith('data:') && !p.includes('/data:'))
          .map((p) => p.startsWith('http') ? p : process.env.BASE_IMAGE_URL + 'image/' + p),
      }));
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
