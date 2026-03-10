import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';

@ApiTags('banners')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  async create(@Body() dto: CreateBannerDto): Promise<BannerResponseDto> {
    return this.bannerService.create(dto);
  }

  @Get()
  async findAll(): Promise<BannerResponseDto[]> {
    return this.bannerService.findAll();
  }

  @Get('active')
  async findActive(): Promise<BannerResponseDto[]> {
    return this.bannerService.findActive();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    return this.bannerService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<BannerResponseDto> {
    return this.bannerService.delete(id);
  }
}
