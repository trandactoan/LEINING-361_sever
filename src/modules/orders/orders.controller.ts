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

    @Post("/callback")
    async handleCallback(@Body() payload: any): Promise<{ returnCode: number; returnMessage: string }> {
        try {
            const { data, overallMac, mac } = payload;
            const { orderId, appId, extradata, method } = data;
            const dataOverallMac = Object.keys(data)
                .sort()
                .map((key) => `${key}=${data[key]}`)
                .join("&");
            const validOverallMac = createHmac(
                "sha256",
                process.env.CHECKOUT_SDK_PRIVATE_KEY!
            ).update(dataOverallMac)
            .digest("hex");
            if (overallMac === validOverallMac) {
                const { myOrderId } = JSON.parse(decodeURIComponent(extradata));
                const order = await this.ordersService.findOne(myOrderId);
                if (order) {
                    order.status = "success";
                    await this.ordersService.updateStatus(myOrderId, order.status);

                    // Call Zalo payment status update API
                    await this.updateOrderPaymentStatus(appId, orderId, 1, method);

                    return {
                        returnCode: 1,
                        returnMessage: "Đã cập nhật trạng thái đơn hàng thành công!",
                    };
                } else {
                throw Error("Không tìm thấy đơn hàng");
                }
            } else {
                throw Error("MAC không hợp lệ");
            }
        } catch (error) {
            return {
                returnCode: 0,
                returnMessage: String(error),
            };
        }
    }

    /**
     * Update order payment status to Zalo
     * @param appId - Mini app ID
     * @param orderId - Checkout SDK order ID
     * @param resultCode - Transaction status: 1 (Success), 0 (Refunded), -1 (Failed)
     * @param paymentMethod - Payment method from callback (COD, bank_transfer, or custom)
     */
    private async updateOrderPaymentStatus(
        appId: string,
        orderId: string,
        resultCode: 1 | 0 | -1,
        paymentMethod?: string
    ): Promise<void> {
        try {
            // Determine the correct endpoint based on payment method
            let endpoint = '';
            if (paymentMethod === 'COD' || paymentMethod === 'COD_SANDBOX') {
                endpoint = `https://payment-mini.zalo.me/api/transaction/${appId}/cod-callback-payment`;
            } else if (paymentMethod === 'bank_transfer') {
                endpoint = `https://payment-mini.zalo.me/api/transaction/${appId}/bank-callback-payment`;
            } else {
                endpoint = `https://payment-mini.zalo.me/api/transaction/${appId}/custom-callback-payment`;
            }

            // Create MAC for authentication
            const dataMac = `appId=${appId}&orderId=${orderId}&resultCode=${resultCode}&privateKey=${process.env.CHECKOUT_SDK_PRIVATE_KEY}`;
            const mac = createHmac('sha256', process.env.CHECKOUT_SDK_PRIVATE_KEY!)
                .update(dataMac)
                .digest('hex');

            // Call Zalo payment status update API
            const response = await axios.post(endpoint, {
                appId,
                orderId,
                resultCode,
                mac
            });

            if (response.data.error !== 0) {
                console.error('Failed to update Zalo payment status:', response.data.msg);
            }
        } catch (error) {
            console.error('Error updating Zalo payment status:', error);
            // Don't throw error to prevent callback from failing
        }
    }
}