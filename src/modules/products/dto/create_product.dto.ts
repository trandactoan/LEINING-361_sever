import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  details?: { title: string; content: string }[];

  @IsOptional()
  @IsArray()
  colors?: { name: string; hex: string }[];

  @IsOptional()
  @IsArray()
  sizes?: string[];

  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @IsOptional()
  @IsString()
  sizeGuide?: string;

  @IsOptional()
  @IsArray()
  variants?: {
    attributes: { name: string; value: string }[];
    price: number;
    originalPrice?: number;
    stock: number;
    sku: string;
    variationImage?: string;
  }[];
}
