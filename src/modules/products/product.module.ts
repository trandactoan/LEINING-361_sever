import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
