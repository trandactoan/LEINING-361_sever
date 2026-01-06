import { Controller, Post, Get, Patch, Body, Param, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { createHmac } from 'crypto';
import axios from 'axios';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
        return this.ordersService.createOrder(createOrderDto);
    }

    @Get()
    async findAll(): Promise<OrderResponseDto[]> {
        return this.ordersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
        return this.ordersService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: string
    ): Promise<OrderResponseDto> {
        return this.ordersService.updateStatus(id, status);
    }

    @Post("/link")
    async LinkOrder(@Body() payload: any): Promise<{ message: string }> {
        const { orderId, checkoutSdkOrderId, miniAppId } = payload;

        // Validate that the order exists
        const order = await this.ordersService.findOne(orderId);
        if (!order) {
            throw new NotFoundException("Không tìm thấy đơn hàng");
        }

        // Store the checkoutSdkOrderId in the order
        await this.ordersService.updateCheckoutSdkOrderId(orderId, checkoutSdkOrderId);

        // Set up delayed payment status check
        setTimeout(async () => {
            try {
                // Check if payment is still pending
                const currentOrder = await this.ordersService.findOne(orderId);
                if (currentOrder.status === "pending") {
                    // Create MAC for payment status check
                    const dataMac = `appId=${miniAppId}&orderId=${checkoutSdkOrderId}&privateKey=${process.env.CHECKOUT_SDK_PRIVATE_KEY}`;
                    const mac = createHmac(
                        "sha256",
                        process.env.CHECKOUT_SDK_PRIVATE_KEY!
                    )
                        .update(dataMac)
                        .digest("hex");

                    // Check payment status from ZaloPay
                    const {
                        data: { data },
                    } = await axios.get<{ data: { returnCode: 0 | 1 | -1 } }>(
                        "https://payment-mini.zalo.me/api/transaction/get-status",
                        {
                            params: {
                                orderId: checkoutSdkOrderId,
                                appId: miniAppId,
                                mac,
                            },
                        }
                    );

                    // Update order status based on payment result
                    if (data.returnCode) {
                        const newStatus = data.returnCode === 1 ? "confirmed" : "cancelled";
                        await this.ordersService.updateStatus(orderId, newStatus);
                    }
                }
            } catch (error) {
                console.error("Error checking payment status:", error);
            }
        }, 20 * 60 * 1000); // Check after 20 minutes

        return { message: "Đã liên kết đơn hàng thành công!" };
    }

}
