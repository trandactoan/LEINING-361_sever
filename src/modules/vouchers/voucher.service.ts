import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Voucher, VoucherDocument } from './voucher.schema';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherResponseDto, ValidateVoucherResponseDto } from './dto/voucher-response.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
  ) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<VoucherResponseDto> {
    const existingVoucher = await this.voucherModel.findOne({
      code: createVoucherDto.code.toUpperCase(),
    });

    if (existingVoucher) {
      throw new BadRequestException('Voucher code already exists');
    }

    const voucherData = {
      ...createVoucherDto,
      code: createVoucherDto.code.toUpperCase(),
      applicableCategories: createVoucherDto.applicableCategories?.map(
        (id) => new Types.ObjectId(id),
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const voucher = await this.voucherModel.create(voucherData);
    return new VoucherResponseDto(voucher);
  }

  async findAll(): Promise<VoucherResponseDto[]> {
    const vouchers = await this.voucherModel.find().sort({ createdAt: -1 }).exec();
    return vouchers.map((v) => new VoucherResponseDto(v));
  }

  async findOne(id: string): Promise<VoucherResponseDto> {
    const voucher = await this.voucherModel.findById(id).exec();
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return new VoucherResponseDto(voucher);
  }

  async findByCode(code: string): Promise<VoucherResponseDto> {
    const voucher = await this.voucherModel.findOne({ code: code.toUpperCase() }).exec();
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return new VoucherResponseDto(voucher);
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<VoucherResponseDto> {
    const updateData: any = {
      ...updateVoucherDto,
      updatedAt: new Date(),
    };

    if (updateVoucherDto.code) {
      updateData.code = updateVoucherDto.code.toUpperCase();
    }

    if (updateVoucherDto.applicableCategories) {
      updateData.applicableCategories = updateVoucherDto.applicableCategories.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const voucher = await this.voucherModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .exec();

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return new VoucherResponseDto(voucher);
  }

  async delete(id: string): Promise<VoucherResponseDto> {
    const voucher = await this.voucherModel.findByIdAndDelete(id).exec();
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return new VoucherResponseDto(voucher);
  }

  async validateVoucher(dto: ValidateVoucherDto): Promise<ValidateVoucherResponseDto> {
    const voucher = await this.voucherModel.findOne({ code: dto.code.toUpperCase() }).exec();

    if (!voucher) {
      return new ValidateVoucherResponseDto({
        valid: false,
        message: 'Mã giảm giá không tồn tại',
      });
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return new ValidateVoucherResponseDto({
        valid: false,
        message: 'Mã giảm giá đã bị vô hiệu hóa',
      });
    }

    // Check date validity
    const now = new Date();
    if (now < voucher.startDate) {
      return new ValidateVoucherResponseDto({
        valid: false,
        message: 'Mã giảm giá chưa có hiệu lực',
      });
    }

    if (now > voucher.endDate) {
      return new ValidateVoucherResponseDto({
        valid: false,
        message: 'Mã giảm giá đã hết hạn',
      });
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return new ValidateVoucherResponseDto({
        valid: false,
        message: 'Mã giảm giá đã hết lượt sử dụng',
      });
    }

    // Check minimum order amount
    if (voucher.minOrderAmount && dto.totalAmount < voucher.minOrderAmount) {
      return new ValidateVoucherResponseDto({
        valid: false,
        message: `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}₫ để sử dụng mã này`,
      });
    }

    // Check category restrictions
    if (voucher.applicableCategories && voucher.applicableCategories.length > 0) {
      if (!dto.categoryIds || dto.categoryIds.length === 0) {
        return new ValidateVoucherResponseDto({
          valid: false,
          message: 'Mã giảm giá không áp dụng cho sản phẩm này',
        });
      }

      const applicableCategoryStrings = voucher.applicableCategories.map((c) => c.toString());
      const hasApplicableCategory = dto.categoryIds.some((catId) =>
        applicableCategoryStrings.includes(catId),
      );

      if (!hasApplicableCategory) {
        return new ValidateVoucherResponseDto({
          valid: false,
          message: 'Mã giảm giá không áp dụng cho sản phẩm này',
        });
      }
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(voucher, dto.totalAmount);

    return new ValidateVoucherResponseDto({
      valid: true,
      voucher,
      discountAmount,
      message: 'Áp dụng mã giảm giá thành công',
    });
  }

  calculateDiscount(voucher: Voucher, totalAmount: number): number {
    let discount = 0;

    if (voucher.discountType === 'percentage') {
      discount = (totalAmount * voucher.discountValue) / 100;
      // Apply max discount cap if set
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    } else {
      // Fixed amount
      discount = voucher.discountValue;
    }

    // Discount cannot exceed total amount
    if (discount > totalAmount) {
      discount = totalAmount;
    }

    return Math.round(discount);
  }

  async incrementUsage(code: string): Promise<void> {
    await this.voucherModel.updateOne(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
    );
  }
}
