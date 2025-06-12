import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductResponseDto } from './dto/product_response.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

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
}
