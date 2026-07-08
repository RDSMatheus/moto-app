import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StoreCourierRepository } from './store-courier.repository';
import { CreateLinkDto } from './dtos/create-link.dto';
import { StoreCourier, StoreCourierStatus } from '@prisma/client';

@Injectable()
export class StoreCourierService {
  constructor(
    private readonly storeCourierRepository: StoreCourierRepository,
  ) {}

  async createLink(data: CreateLinkDto): Promise<StoreCourier> {
    try {
      const { courierId, storeId } = data;

      if (!courierId)
        throw new UnprocessableEntityException('courierId is required');
      if (!storeId)
        throw new UnprocessableEntityException('storeId is required');

      const link = await this.storeCourierRepository.createLink({
        storeId: data.storeId,
        courierId: data.courierId,
        status: StoreCourierStatus.PENDING,
      });

      return link;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<StoreCourier[]> {
    return await this.storeCourierRepository.findAll();
  }

  async findOne(id: string): Promise<StoreCourier> {
    const storeCourier = await this.storeCourierRepository.findOne(id);

    if (!storeCourier) {
      throw new NotFoundException(`Store Courier ${id} not found`);
    }

    return storeCourier;
  }

  async updateLink(
    id: string,
    data: Partial<Omit<CreateLinkDto, 'storeId' | 'courierId'>> & {
      status?: StoreCourierStatus;
    },
  ): Promise<StoreCourier> {
    const { status, ...updateData } = data;

    return await this.storeCourierRepository.updateLink(id, {
      ...updateData,
      ...(status && { status }),
    });
  }

  async removeLink(id: string): Promise<StoreCourier> {
    return await this.storeCourierRepository.removeLink(id);
  }
}
