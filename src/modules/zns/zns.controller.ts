import { ApiTags } from '@nestjs/swagger';
import { ZnsService } from './zns.service';
import { Body, Controller, Param, Post } from '@nestjs/common';
import { ZnsSendRequestDto } from './dto/zns_send_request.dto';

@ApiTags('zns')
@Controller('zns')
export class ZnsController {
  constructor(private znsService: ZnsService) {}
  @Post('send-zns')
  async sendZns(
    @Param('id') id: string,
    @Body() znsSendRequest: ZnsSendRequestDto,
  ): Promise<any> {
    return this.znsService.sendZNS(
      znsSendRequest.phone,
      znsSendRequest.templateData,
      znsSendRequest.templateId,
    );
  }
}
