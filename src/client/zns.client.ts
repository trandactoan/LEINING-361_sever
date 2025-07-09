import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TokenService } from 'src/common/modules/tokens/token.service';
import { TokenNameConstant } from 'src/constants/token-name.constant';

@Injectable()
export class ZnsClient {
  constructor(private tokenService: TokenService) {}
  async refreshAccessToken(appId: string, refreshToken: string) {
    const response = await axios.post(
      process.env.ZALO_OAUTH_URL!,
      {
        app_id: appId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: process.env.ZALO_APP_SECRET_KEY,
        },
      },
    );

    const {
      access_token,
      expires_in,
      refresh_token: newRefreshToken,
    } = response.data;

    return {
      access_token,
      refresh_token: newRefreshToken || refreshToken,
      expires_at: Date.now() + expires_in * 1000,
    };
  }
  async getValidAccessToken(): Promise<string> {
    const tokenDoc = await this.tokenService.getToken(
      TokenNameConstant.ZNS_TOKEN,
    ); // Assuming only 1 OA

    if (!tokenDoc) throw new Error('No token stored.');

    const now = Date.now();
    const buffer = 60 * 1000; // 1 minute buffer

    if (now >= tokenDoc.expiredDate - buffer) {
      const refreshed = await this.refreshAccessToken(
        process.env.ZALO_APP_ID!,
        process.env.ZNS_REFRESH_TOKEN!,
      );
      tokenDoc.accessToken = refreshed.access_token;
      tokenDoc.expiredDate = refreshed.expires_at;
      await this.tokenService.update(tokenDoc._id.toString(), tokenDoc);
      return tokenDoc.accessToken;
    }
    return tokenDoc.accessToken;
  }
  async sendZNS(
    phoneNumber: string,
    templateData: Record<string, any>,
    templateId: string,
  ): Promise<any> {
    const token = await this.getValidAccessToken();
    console.log('This is phone number: ' + phoneNumber);
    const result = await axios.post(
      process.env.ZNS_SEND_URL!,
      {
        phone: phoneNumber,
        template_id: templateId,
        template_data: {
          ...templateData,
          order_code: templateData.orderCode,
        },
      },
      {
        headers: {
          access_token: token,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('This is result');
    console.log(result);
    return result.data;
  }
}
