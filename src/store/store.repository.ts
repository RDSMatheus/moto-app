import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewStore } from './entity/store.entity';
import { Prisma, Store, Tenant } from '@prisma/client';
import { UpdateStoreDto } from './store.service';

@Injectable()
export class StoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Store | null> {
    return this.prisma.store.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Store | null> {
    return this.prisma.store.findUnique({
      where: { email },
    });
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<Store | null> {
    return this.prisma.store.findUnique({
      where: { cpfCnpj },
    });
  }

  async findAll(): Promise<Store[]> {
    return this.prisma.store.findMany();
  }

  async createStoreWithTenant(data: NewStore): Promise<{
    store: Store;
    tenant: Tenant;
  }> {
    const { name } = data;
    return await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name } });

      const store = await tx.store.create({
        data: {
          tenantId: tenant.id,
          ...data,
        },
      });

      return { store, tenant };
    });
  }

  async update(id: string, data: UpdateStoreDto): Promise<Store> {
    return await this.prisma.store.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Store> {
    return this.prisma.store.delete({
      where: { id },
    });
  }
}
