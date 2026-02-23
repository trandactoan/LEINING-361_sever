import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { VoucherResponseDto, ValidateVoucherResponseDto } from './dto/voucher-response.dto';

@ApiTags('voucher')
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto): Promise<VoucherResponseDto> {
    return this.voucherService.create(createVoucherDto);
  }

  @Get()
  async findAll(): Promise<VoucherResponseDto[]> {
    return this.voucherService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VoucherResponseDto> {
    return this.voucherService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<VoucherResponseDto> {
    return this.voucherService.findByCode(code);
  }

  @Post('validate')
  async validate(@Body() validateVoucherDto: ValidateVoucherDto): Promise<ValidateVoucherResponseDto> {
    return this.voucherService.validateVoucher(validateVoucherDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ): Promise<VoucherResponseDto> {
    return this.voucherService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<VoucherResponseDto> {
    return this.voucherService.delete(id);
  }
}
