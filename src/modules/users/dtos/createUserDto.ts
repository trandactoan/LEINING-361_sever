// users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'username' })
  username: string;

  @IsEmail()
  @ApiProperty({ type: String, description: 'email' })
  email: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, description: 'age' })
  age?: number;
}
