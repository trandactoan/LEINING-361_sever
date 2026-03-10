import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  imageUrl: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
