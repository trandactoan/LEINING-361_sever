import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { ProductResponseDto } from './dto/product_response.dto';
import { UpdateProductDto } from './dto/update_product.dto';
import { CreateProductDto } from './dto/create_product.dto';

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
  async updateProduct(
    id: string,
    updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    Object.assign(product, updateDto);
    const objectId = new Types.ObjectId(product.id);
    const result = await this.productModel.findOneAndUpdate(
      { _id: objectId },
      { $set: product },
      { new: true, runValidators: true },
    );
    return new ProductResponseDto(result!);
  }
  async createProduct(
    createDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const result = await this.productModel.create(createDto);
    return new ProductResponseDto(result);
  }
}
