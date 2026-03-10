import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async create(dto: CreateBannerDto): Promise<BannerResponseDto> {
    const banner = await this.bannerModel.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return new BannerResponseDto(banner);
  }

  async findAll(): Promise<BannerResponseDto[]> {
    const banners = await this.bannerModel.find().sort({ order: 1, createdAt: 1 }).exec();
    return banners.map((b) => new BannerResponseDto(b));
  }

  async findActive(): Promise<BannerResponseDto[]> {
    const banners = await this.bannerModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
    return banners.map((b) => new BannerResponseDto(b));
  }

  async update(id: string, dto: UpdateBannerDto): Promise<BannerResponseDto> {
    const banner = await this.bannerModel
      .findByIdAndUpdate(id, { $set: { ...dto, updatedAt: new Date() } }, { new: true, runValidators: true })
      .exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return new BannerResponseDto(banner);
  }

  async delete(id: string): Promise<BannerResponseDto> {
    const banner = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return new BannerResponseDto(banner);
  }
}
