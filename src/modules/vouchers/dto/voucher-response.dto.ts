import { Voucher } from '../voucher.schema';

export class VoucherResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableCategories: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(voucher: Voucher) {
    this.id = voucher._id?.toString() || '';
    this.code = voucher.code;
    this.name = voucher.name;
    this.description = voucher.description;
    this.discountType = voucher.discountType;
    this.discountValue = voucher.discountValue;
    this.minOrderAmount = voucher.minOrderAmount || 0;
    this.maxDiscountAmount = voucher.maxDiscountAmount;
    this.usageLimit = voucher.usageLimit;
    this.usedCount = voucher.usedCount || 0;
    this.startDate = voucher.startDate;
    this.endDate = voucher.endDate;
    this.isActive = voucher.isActive;
    this.applicableCategories = voucher.applicableCategories?.map(c => c.toString()) || [];
    this.createdAt = voucher.createdAt;
    this.updatedAt = voucher.updatedAt;
  }
}

export class ValidateVoucherResponseDto {
  valid: boolean;
  voucher?: VoucherResponseDto;
  discountAmount?: number;
  message?: string;

  constructor(data: {
    valid: boolean;
    voucher?: Voucher;
    discountAmount?: number;
    message?: string;
  }) {
    this.valid = data.valid;
    this.voucher = data.voucher ? new VoucherResponseDto(data.voucher) : undefined;
    this.discountAmount = data.discountAmount;
    this.message = data.message;
  }
}
