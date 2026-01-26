import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { ZnsModule } from '../zns/zns.module';

@Module({
  imports: [ZnsModule],
  providers: [],
  controllers: [CommonController],
})
export class CommonModule {}
