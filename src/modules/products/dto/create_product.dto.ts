import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @IsString()
  images?: string[];

  @IsString()
  categoryId: string;

  @IsOptional()
  colors?: { name: string | undefined; hex: string | undefined }[];

  @IsOptional()
  @IsString()
  sizes?: string[];
}
