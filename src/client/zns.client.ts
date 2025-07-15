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
    const accessToken = await this.tokenService.getToken(
      TokenNameConstant.ZNS_ACCESS_TOKEN,
    ); // Assuming only 1 OA

    const refreshToken = await this.tokenService.getToken(
      TokenNameConstant.ZNS_REFRESH_TOKEN,
    );

    if (!accessToken) throw new Error('No token stored.');

    const now = Date.now();
    const buffer = 60 * 1000; // 1 minute buffer

    if (now >= accessToken.expiredDate - buffer) {
      const refreshed = await this.refreshAccessToken(
        process.env.ZALO_APP_ID!,
        refreshToken.token,
      );
      accessToken.token = refreshed.access_token;
      accessToken.expiredDate = refreshed.expires_at;
      refreshToken.token = refreshed.refresh_token;
      await this.tokenService.update(accessToken._id.toString(), accessToken);
      await this.tokenService.update(refreshToken._id.toString(), refreshToken);
      return accessToken.token;
    }
    return accessToken.token;
  }
  async sendZNS(
    phoneNumber: string,
    templateData: Record<string, any>,
    templateId: string,
  ): Promise<any> {
    const token = await this.getValidAccessToken();
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
    return result.data;
  }
}
