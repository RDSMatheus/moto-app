import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Order, Prisma } from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrderUncheckedCreateInput): Promise<Order> {
    return await this.prisma.order.create({
      data,
    });
  }

  async findAll(): Promise<Order[]> {
    return await this.prisma.order.findMany();
  }

  async findOne(id: number): Promise<Order | null> {
    return await this.prisma.order.findFirst({
      where: { id },
    });
  }

  async markArrived(orderId: number): Promise<Order> {
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'ARRIVED_AT_STORE', arrivedAt: new Date() },
    });
  }

  async updateStatusIfPending(orderId: number, courierId: string) {
    console.log(orderId);
    return await this.prisma.order.updateMany({
      where: {
        id: orderId,
        status: 'PENDING',
      },
      data: {
        status: 'ACCEPTED',
        courierId,
        acceptedAt: new Date(),
      },
    });
  }

  async inRoute(orderId: number): Promise<Order> {
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_ROUTE', inRouteAt: new Date() },
    });
  }

  async update(
    id: number,
    data: Prisma.OrderUncheckedUpdateInput,
  ): Promise<Order> {
    return await this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Order> {
    return await this.prisma.order.delete({
      where: { id },
    });
  }

  async delivered(id: number): Promise<Order> {
    return await this.prisma.order.update({
      where: { id },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    });
  }
}
