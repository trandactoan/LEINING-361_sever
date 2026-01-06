import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/order.schema';

@Module({
  imports: [],
  providers: [],
  controllers: [CommonController],
})
export class CommonModule {}
