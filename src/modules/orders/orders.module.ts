import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { GoogleSheetsService } from './google-sheets.service';
import { Order, OrderSchema } from './order.schema';
import { ProductDetail, ProductDetailSchema } from '../products/product_detail.schema';
import { VoucherModule } from '../vouchers/voucher.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: ProductDetail.name, schema: ProductDetailSchema },
        ]),
        VoucherModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, GoogleSheetsService],
    exports: [OrdersService],
})
export class OrdersModule {}
