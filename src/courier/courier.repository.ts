import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Courier, Prisma } from '@prisma/client';

export interface UpdateCourierLocationInput {
  id: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
}

@Injectable()
export class CourierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Courier | null> {
    return await this.prisma.courier.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Courier | null> {
    return await this.prisma.courier.findUnique({
      where: { email },
    });
  }

  async findByCpf(cpf: string): Promise<Courier | null> {
    return await this.prisma.courier.findUnique({
      where: { cpf },
    });
  }

  async create(data: Prisma.CourierUncheckedCreateInput): Promise<Courier> {
    return await this.prisma.courier.create({
      data,
    });
  }

  async updateLocation(data: UpdateCourierLocationInput): Promise<Courier> {
    const { id, latitude, longitude, isOnline } = data;

    return await this.prisma.courier.update({
      where: { id },
      data: {
        latitude,
        longitude,
        ...(isOnline !== undefined && { isOnline }),
      },
    });
  }

  async updateStatus(id: string, isOnline: boolean): Promise<Courier> {
    return await this.prisma.courier.update({
      where: { id },
      data: { isOnline },
    });
  }

  async update(
    id: string,
    data: Prisma.CourierUncheckedUpdateInput,
  ): Promise<Courier> {
    return await this.prisma.courier.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<Courier[]> {
    return await this.prisma.courier.findMany();
  }

  async findOnline(): Promise<Courier[]> {
    return await this.prisma.courier.findMany({
      where: {
        isOnline: true,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.courier.delete({
      where: {
        id,
      },
    });
  }
}
