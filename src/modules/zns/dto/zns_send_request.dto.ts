import { IsObject, IsString } from 'class-validator';

export class ZnsSendRequestDto {
  @IsString()
  templateId: string;

  @IsObject()
  templateData: Record<string, any>;

  @IsString()
  phone: string;
}
