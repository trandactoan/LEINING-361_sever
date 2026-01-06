import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from '../../app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../users/user.module';
import { ProductModule } from '../products/product.module';
import { CategoryModule } from '../categories/category.module';
import { ZnsModule } from '../zns/zns.module';
import { TokenModule } from 'src/common/modules/tokens/token.module';
import { ImageModule } from 'src/common/modules/images/image.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OrdersModule } from '../orders/orders.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: '/var/www/public/image',
      serveRoot: '/image',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? ''),
    UserModule,
    ProductModule,
    CategoryModule,
    OrdersModule,
    ZnsModule,
    TokenModule,
    ImageModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
