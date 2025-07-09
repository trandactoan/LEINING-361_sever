import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductResponseDto } from './dto/product_response.dto';
import { UpdateProductDto } from './dto/update_product.dto';
import { CreateProductDto } from './dto/create_product.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getAllProducts(): Promise<ProductResponseDto[]> {
    return await this.productService.getAll();
  }

  @Get('by-category/:category_id')
  async getProductsByCategory(
    @Param('category_id') category_id: string,
  ): Promise<ProductResponseDto[]> {
    return await this.productService.getProductListByCategory(category_id);
  }

  @Get('by-id/:product_id')
  async getProductsById(
    @Param('product_id') product_id: string,
  ): Promise<ProductResponseDto> {
    return await this.productService.getProductById(product_id);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(id, updateProductDto);
  }
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    await this.productService.delete(id);
  }
  @Post('create-product')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productService.createProduct(createProductDto);
  }
}
