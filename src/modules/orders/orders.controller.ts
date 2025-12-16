import { Controller, Post, Get, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

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
}
