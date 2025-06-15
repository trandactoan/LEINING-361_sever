import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { ProductResponseDto } from './dto/product_response.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }
  async getProductListByCategory(
    categoryId: string,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productModel
      .find({
        categoryId: categoryId,
      })
      .exec();
    return products.map((result) => new ProductResponseDto(result));
  }
  async getProductById(productId: string): Promise<ProductResponseDto> {
    const productObjectId = new Types.ObjectId(productId);
    const product = await this.productModel.findById(productObjectId).exec();
    return new ProductResponseDto(product!);
  }
  async getAll(): Promise<ProductResponseDto[]> {
    const products = await this.productModel.find().exec();
    return products.map((result) => new ProductResponseDto(result));
  }
}
