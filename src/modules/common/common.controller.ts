import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createHmac } from 'crypto';
import { CreateMacRequestDto } from './dto/create_mac_request.dto';
import { Console } from 'console';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor() {}
  @Post("/mac")
  async GetMac(@Body() CreateMacRequestDto: CreateMacRequestDto) {
    // Validate that the private key is configured
    if (!process.env.CHECKOUT_SDK_PRIVATE_KEY) {
      throw new Error('CHECKOUT_SDK_PRIVATE_KEY is not configured in environment variables');
    }
    console.log("Data mac");
    console.log(CreateMacRequestDto);
    
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

    console.log("Generated MAC:", mac);
    return { mac };
  }

  @Post("/callback")
  async HandleCallback(@Body() payload: any) {
    console.log("Received callback:", payload);
    return { message: "Callback received" };
  }
}
