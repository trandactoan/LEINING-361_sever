import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from '../../app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../users/user.module';
import { ProductModule } from '../products/product.module';
import { CategoryModule } from '../categories/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? ''),
    UserModule,
    ProductModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
