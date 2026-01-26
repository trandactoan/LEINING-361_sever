import { Module } from '@nestjs/common';
import { ZnsController } from './zns.controller';
import { ZnsService } from './zns.service';
import { ZnsClient } from 'src/client/zns.client';
import { TokenModule } from 'src/common/modules/tokens/token.module';

@Module({
  imports: [TokenModule],
  providers: [ZnsService, ZnsClient],
  controllers: [ZnsController],
  exports: [ZnsClient],
})
export class ZnsModule {}
