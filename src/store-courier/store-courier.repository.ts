import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, StoreCourier } from '@prisma/client';

@Injectable()
export class StoreCourierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLink(
    data: Prisma.StoreCourierUncheckedCreateInput,
  ): Promise<StoreCourier> {
    return await this.prisma.storeCourier.create({
      data,
    });
  }

  async findAll(): Promise<StoreCourier[]> {
    return this.prisma.storeCourier.findMany();
  }

  async findOne(id: string): Promise<StoreCourier | null> {
    return this.prisma.storeCourier.findUnique({
      where: { id },
    });
  }

  async findStoreCourier(
    courierId: string,
    storeId: string,
  ): Promise<StoreCourier | null> {
    const link = await this.prisma.storeCourier.findUnique({
      where: { storeId_courierId: { courierId: courierId, storeId: storeId } },
    });

    return link;
  }

  async updateLink(
    id: string,
    data: Prisma.StoreCourierUncheckedUpdateInput,
  ): Promise<StoreCourier> {
    return this.prisma.storeCourier.update({
      where: { id },
      data,
    });
  }

  async removeLink(id: string): Promise<StoreCourier> {
    return this.prisma.storeCourier.delete({
      where: { id },
    });
  }
}
