import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { createHmac } from 'crypto';
import { CreateMacRequestDto } from './dto/create_mac_request.dto';
import { ZnsClient } from 'src/client/zns.client';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor(private readonly znsClient: ZnsClient) {}
  @Post("/mac")
  async GetMac(@Body() CreateMacRequestDto: CreateMacRequestDto) {
    // Validate that the private key is configured
    if (!process.env.CHECKOUT_SDK_PRIVATE_KEY) {
      throw new Error('CHECKOUT_SDK_PRIVATE_KEY is not configured in environment variables');
    }

    const dataMac = Object.keys(CreateMacRequestDto)
       .sort()
       .map(
         (key) =>
           `${key}=${
             typeof CreateMacRequestDto[key] === "object"
               ? JSON.stringify(CreateMacRequestDto[key])
               : CreateMacRequestDto[key]
           }`
       )
       .join("&");
    const mac = createHmac("sha256", process.env.CHECKOUT_SDK_PRIVATE_KEY)
                .update(dataMac)
                .digest("hex");

    return { mac };
  }

  @Post("/callback")
  async HandleCallback(@Body() _payload: any) {
    return { message: "Callback received" };
  }

  @Post("/decode-phone")
  @ApiOperation({ summary: 'Decode phone number from Zalo Mini App token' })
  async DecodePhone(@Body() body: { accessToken: string; phoneToken: string }) {
    const phone = await this.znsClient.decodePhoneNumber(
      body.accessToken,
      body.phoneToken,
    );
    return { phone };
  }
}
