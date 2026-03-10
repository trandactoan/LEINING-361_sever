import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
