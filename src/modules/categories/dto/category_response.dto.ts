import { Category } from '../category.schema';

export class CategoryResponseDto {
  _id: string;
  name: string;
  image: string;

  constructor(category: Category) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    this._id = category._id?.toString()!;
    this.name = category.name;
    const BASE_URL = process.env.BASE_IMAGE_URL + 'public/image/';
    if (category.image && !category.image.startsWith('http')) {
      this.image = BASE_URL + category.image;
    } else {
      this.image = category.image;
    }
  }
}
