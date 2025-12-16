import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { ProductDetail, ProductDetailSchema } from './product_detail.schema';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ImageModule } from 'src/common/modules/images/image.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductDetail.name, schema: ProductDetailSchema },
    ]),
    ImageModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
