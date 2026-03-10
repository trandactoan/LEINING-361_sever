import { Banner } from '../banner.schema';

export class BannerResponseDto {
  id: string;
  imageUrl: string;
  order: number;
  link?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(banner: Banner) {
    this.id = banner._id?.toString() || '';
    this.imageUrl = banner.imageUrl;
    this.order = banner.order;
    this.link = banner.link;
    this.isActive = banner.isActive;
    this.createdAt = banner.createdAt;
    this.updatedAt = banner.updatedAt;
  }
}
