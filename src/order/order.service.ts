import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto, UpdateOrderDto } from './dtos/order.dto';
import { StoreService } from 'src/store/store.service';
import { CourierService } from 'src/courier/courier.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly storeService: StoreService,
    private readonly courierService: CourierService,
  ) {}

  async createOrder(order: CreateOrderDto): Promise<Order> {
    try {
      const { storeId, tenantId, totalPrice } = order;

      const store = await this.storeService.findOne(storeId);

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      if (store.tenantId !== tenantId) {
        throw new UnprocessableEntityException('Tenant ID does not match');
      }

      return await this.orderRepository.create({
        storeId,
        tenantId,
        totalPrice,
        status: OrderStatus.PENDING,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.findAll();
    } catch {
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async findOne(id: number): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne(id);

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }

  async update(id: number, data: UpdateOrderDto): Promise<Order> {
    try {
      const existingOrder = await this.orderRepository.findOne(id);

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (data.courierId) {
        const courier = await this.courierService.findOne(data.courierId);
        if (!courier) {
          throw new NotFoundException('Courier not found');
        }
      }

      return await this.orderRepository.update(id, {
        ...(data.status && { status: data.status }),
        ...(data.courierId !== undefined && { courierId: data.courierId }),
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async remove(id: number): Promise<Order> {
    try {
      const existingOrder = await this.orderRepository.findOne(id);

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return await this.orderRepository.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete order');
    }
  }
}
