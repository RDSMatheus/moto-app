import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '@prisma/client';
import type { CreateOrderDto, UpdateOrderDto } from './dtos/order.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Access token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Criar uma nova ordem' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        storeId: { type: 'string', example: 'uuid-string' },
        totalPrice: { type: 'number', example: 50.0 },
        tenantId: { type: 'string', example: 'uuid-string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ordem criada com sucesso',
  })
  async createOrder(@Body() order: CreateOrderDto): Promise<Order> {
    return await this.orderService.createOrder(order);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Listar todas as ordens' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens retornada',
  })
  async findAll(): Promise<Order[]> {
    return await this.orderService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar uma ordem por ID' })
  @ApiParam({ name: 'id', description: 'ID da ordem', example: 'integer' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  async findOne(@Param('id') id: number): Promise<Order> {
    return await this.orderService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar uma ordem existente' })
  @ApiParam({ name: 'id', description: 'ID da ordem', example: 'integer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'ACCEPTED', 'IN_ROUTE', 'DELIVERED', 'CANCELLED'],
          example: 'ACCEPTED',
        },
        courierId: { type: 'string', nullable: true, example: 'uuid-string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Ordem atualizada' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  async update(
    @Param('id') id: number,
    @Body() data: UpdateOrderDto,
  ): Promise<Order> {
    return await this.orderService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Deletar uma ordem' })
  @ApiParam({ name: 'id', description: 'ID da ordem', example: 'integer' })
  @ApiResponse({ status: 200, description: 'Ordem deletada' })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada' })
  async remove(@Param('id') id: number): Promise<Order> {
    return await this.orderService.remove(id);
  }
}
