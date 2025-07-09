import { Injectable } from '@nestjs/common';
import { ZnsClient } from 'src/client/zns.client';

@Injectable()
export class ZnsService {
  constructor(private znsClient: ZnsClient) {}
  async sendZNS(
    phoneNumber: string,
    templateData: Record<string, any>,
    templateId: string,
  ): Promise<any> {
    await this.znsClient.sendZNS(phoneNumber, templateData, templateId);
  }
}
