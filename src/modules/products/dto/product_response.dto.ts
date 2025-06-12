import { Product } from '../product.schema';

export class ProductResponseDto {
  _id: string;
  categoryId: string | undefined;
  price: number | undefined;
  originalPrice: number | undefined;
  image: string | undefined;
  descriptions: { title: string | undefined; content: string | undefined }[];
  sizes: string[];
  colors: { name: string | undefined; hex: string | undefined }[];

  constructor(product: Product) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    this._id = product._id?.toString()!;
    this.categoryId = product.categoryId?.toString();
    this.price = product.price;
    this.originalPrice = product.originalPrice;
    const BASE_URL = process.env.BASE_IMAGE_URL + 'public/image/';
    if (product.image && !product.image.startsWith('http')) {
      this.image = BASE_URL + product.image;
    } else {
      this.image = product.image;
    }
    this.descriptions = product.descriptions!;
    this.sizes = product.sizes!;
    this.colors = product.colors!;
  }
}
