import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class ValidateVoucherDto {
  @IsString()
  code: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];
}
