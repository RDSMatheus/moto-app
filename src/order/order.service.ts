import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto, UpdateOrderDto } from './dtos/order.dto';
import { StoreService } from 'src/store/store.service';
import { CourierService } from 'src/courier/courier.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StoreCourierService } from 'src/store-courier/store-courier.service';
import { calculateDistance } from 'src/common/utils/geo.utils';
import { GeocodingService } from 'src/geocoding/geocoding.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly storeService: StoreService,
    private readonly courierService: CourierService,
    private readonly eventEmitter: EventEmitter2,
    private readonly storeCourierService: StoreCourierService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async createOrder(order: CreateOrderDto): Promise<Order> {
    try {
      const {
        storeId,
        tenantId,
        totalPrice,
        city,
        neighborhood,
        number,
        state,
        street,
        zipCode,
        complement,
        phone,
      } = order;

      const store = await this.storeService.findOne(storeId);

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      const { latitude, longitude } =
        await this.geocodingService.geocodeAddress({
          neighborhood,
          number,
          state,
          city,
          zipCode,
          street,
        });

      console.log({ latitude, longitude });

      if (store.tenantId !== tenantId) {
        throw new UnprocessableEntityException('Tenant ID does not match');
      }

      const newOrder = await this.orderRepository.create({
        storeId,
        tenantId,
        totalPrice,
        status: OrderStatus.PENDING,
        city,
        neighborhood,
        number,
        state,
        street,
        zipCode,
        complement,
        phone,
        latitude,
        longitude,
      });

      if (!newOrder) throw new InternalServerErrorException();

      this.eventEmitter.emit('order.created', newOrder);

      return newOrder;
    } catch (error) {
      console.log(error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async markArrived({
    orderId,
    courierId,
  }: {
    orderId: number;
    courierId: string;
  }): Promise<Order> {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) throw new NotFoundException('Order not found');

    if (courierId !== order.courierId)
      throw new ForbiddenException('You cannot accept this order');

    const courier = await this.courierService.findOne(courierId);
    const store = await this.storeService.findOne(order.storeId);

    if (!courier.latitude || !courier.longitude) {
      throw new UnprocessableEntityException(
        'Localização do motoboy indisponível — ative o GPS',
      );
    }

    if (!store.latitude || !store.longitude) {
      throw new UnprocessableEntityException(
        'Localização da loja não cadastrada',
      );
    }

    const distancia = calculateDistance(
      store.latitude,
      store.longitude,
      courier.latitude,
      courier.longitude,
    );

    if (distancia > 100) {
      throw new UnprocessableEntityException(
        `Você está a ${Math.round(distancia)}m da loja. Aproxime-se para confirmar.`,
      );
    }

    const arrived = await this.orderRepository.markArrived(orderId);

    this.eventEmitter.emit('order.arrived', arrived);
    return arrived;
  }

  async acceptOrder({
    orderId,
    courierId,
    storeId,
  }: {
    orderId: number;
    storeId: string;
    courierId: string;
  }) {
    try {
      const order = await this.orderRepository.findOne(orderId);

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      console.log(order.storeId, storeId);
      if (order.storeId !== storeId) {
        throw new UnprocessableEntityException('Store ID does not match');
      }

      const link = await this.storeCourierService.findStoreCourier(
        courierId,
        storeId,
      );

      if (!link) {
        throw new NotAcceptableException('Link is not active');
      }

      if (link.status !== 'ACTIVE') {
        throw new ForbiddenException('Você não está ativo nessa loja');
      }

      const updated = await this.orderRepository.updateStatusIfPending(
        orderId,
        courierId,
      );

      if (updated.count === 0) {
        throw new ConflictException('Pedido já foi aceito por outro motoboy');
      }

      const updatedOrder = await this.orderRepository.findOne(orderId);

      this.eventEmitter.emit('order.accepted', updatedOrder);

      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException ||
        error instanceof ConflictException ||
        error instanceof NotAcceptableException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async delivered({
    orderId,
    courierId,
    storeId,
  }: {
    orderId: number;
    storeId: string;
    courierId: string;
  }) {
    try {
      const order = await this.orderRepository.findOne(orderId);
      const courier = await this.courierService.findOne(courierId);

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.storeId !== storeId) {
        throw new UnprocessableEntityException('Store ID does not match');
      }

      const link = await this.storeCourierService.findStoreCourier(
        courierId,
        storeId,
      );

      if (!link) {
        throw new NotAcceptableException('Link is not active');
      }

      if (link.status !== 'ACTIVE') {
        throw new ForbiddenException('Você não está ativo nessa loja');
      }

      if (!courier.latitude || !courier.longitude) {
        throw new UnprocessableEntityException(
          'Localização do motoboy indisponível — ative o GPS',
        );
      }

      const distancia = calculateDistance(
        order.latitude,
        order.longitude,
        courier.latitude,
        courier.longitude,
      );

      if (distancia > 100) {
        throw new UnprocessableEntityException(
          `Você está a ${Math.round(distancia)}m do cliente. Aproxime-se para confirmar.`,
        );
      }

      const deliveredOrder = await this.orderRepository.delivered(orderId);

      this.eventEmitter.emit('order.delivered', deliveredOrder);

      return deliveredOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException ||
        error instanceof ConflictException ||
        error instanceof NotAcceptableException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async inRoute({
    orderId,
    courierId,
    storeId,
  }: {
    orderId: number;
    storeId: string;
    courierId: string;
  }) {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    console.log(order.storeId, storeId);
    if (order.storeId !== storeId) {
      throw new UnprocessableEntityException('Store ID does not match');
    }

    const link = await this.storeCourierService.findStoreCourier(
      courierId,
      storeId,
    );

    if (!link) {
      throw new NotAcceptableException('Link is not active');
    }

    if (link.status !== 'ACTIVE') {
      throw new ForbiddenException('Você não está ativo nessa loja');
    }

    const updated = await this.orderRepository.inRoute(orderId);

    if (!updated) {
      throw new ConflictException('Não possivel colocar em rota');
    }

    const updatedOrder = await this.orderRepository.findOne(orderId);

    this.eventEmitter.emit('order.in_route', updatedOrder);

    return updatedOrder;
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
