import { IsOptional, IsString, IsNumber, isNumber } from 'class-validator';

export class UpdateProductDto {
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

  @IsOptional()
  colors?: { name: string | undefined; hex: string | undefined }[];

  @IsOptional()
  @IsString()
  sizes?: string[];

  @IsOptional()
  @IsString()
  sizeGuide?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  soldCount?: number;

  @IsOptional()
  variants?: any[];

  @IsOptional()
  variantOptions?: { name: string; values: string[] }[];
}
