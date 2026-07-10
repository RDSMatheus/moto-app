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
    return this.prisma.order.findMany();
  }

  async findOne(id: number): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    data: Prisma.OrderUncheckedUpdateInput,
  ): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Order> {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
