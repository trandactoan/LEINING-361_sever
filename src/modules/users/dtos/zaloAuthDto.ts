import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class ZaloUserInfoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Unique user identifier from getUserInfo()' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'User display name' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String, description: 'User avatar URL' })
  avatar?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String, description: 'Official Account-specific identifier' })
  idByOA?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean, description: 'Whether user follows the Official Account' })
  followedOA?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ type: Boolean, description: 'Indicates if special data handling required' })
  isSensitive?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String, description: 'Token from getPhoneNumber() to decode phone on backend' })
  phoneToken?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String, description: 'Access token from Mini App SDK getAccessToken()' })
  accessToken?: string;
}