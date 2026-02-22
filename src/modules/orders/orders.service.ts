import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { ProductDetail, ProductDetailDocument } from '../products/product_detail.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetailDocument>,
        private googleSheetsService: GoogleSheetsService,
    ) {}

    async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
        // Start a session for transaction
        const session = await this.orderModel.db.startSession();
        session.startTransaction();

        try {
            // Validate and update stock for each item with variants
            for (const item of createOrderDto.items) {
                if (item.variantId) {
                    const variant = await this.productDetailModel.findById(item.variantId).session(session);

                    if (!variant) {
                        throw new NotFoundException(`Variant ${item.variantId} not found`);
                    }

                    // Update stock
                    variant.stock -= item.quantity;
                    await variant.save({ session });

                    this.logger.log(`Updated stock for variant ${item.variantId}: ${variant.stock + item.quantity} -> ${variant.stock}`);
                }
            }

            // Create the order
            const order = new this.orderModel({
                ...createOrderDto,
                items: createOrderDto.items.map(item => ({
                    ...item,
                    productId: new Types.ObjectId(item.productId),
                    variantId: item.variantId ? new Types.ObjectId(item.variantId) : undefined,
                })),
                status: 'pending',
            });

            await order.save({ session });

            // Commit transaction
            await session.commitTransaction();

            this.logger.log(`Order ${order._id} created successfully`);

            // Append to Google Sheets (async, don't wait)
            this.googleSheetsService.appendOrderToSheet(order).catch(err => {
                this.logger.error(`Failed to append order ${order._id} to Google Sheets`, err.stack);
            });

            return new OrderResponseDto(order);

        } catch (error) {
            // Rollback transaction on error
            await session.abortTransaction();
            this.logger.error(`Failed to create order: ${error.message}`, error.stack);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async findAll(): Promise<OrderResponseDto[]> {
        const orders = await this.orderModel.find().sort({ createdAt: -1 });
        return orders.map(order => new OrderResponseDto(order));
    }

    async findOne(id: string): Promise<OrderResponseDto> {
        const order = await this.orderModel.findById(id);
        if (!order) {
            throw new NotFoundException(`Order ${id} not found`);
        }
        return new OrderResponseDto(order);
    }

    async updateStatus(id: string, status: string): Promise<OrderResponseDto> {
        const order = await this.orderModel.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            throw new NotFoundException(`Order ${id} not found`);
        }

        return new OrderResponseDto(order);
    }

    async updateCheckoutSdkOrderId(id: string, checkoutSdkOrderId: string): Promise<OrderResponseDto> {
        const order = await this.orderModel.findByIdAndUpdate(
            id,
            { checkoutSdkOrderId, updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            throw new NotFoundException(`Order ${id} not found`);
        }

        return new OrderResponseDto(order);
    }
}
