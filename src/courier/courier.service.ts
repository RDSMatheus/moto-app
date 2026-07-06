import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CourierRepository } from './courier.repository';
import { CreateCourierDto } from './dtos/create-courier.dto';
import { Courier } from '@prisma/client';
import { UpdateCourierDto } from './dtos/update-courier.dto';
import { HashService } from 'src/common/hash/hash.service';

export interface UpdateLocationDto {
  id: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
}

@Injectable()
export class CourierService {
  constructor(
    private readonly courierRepository: CourierRepository,
    private readonly hashService: HashService,
  ) {}

  async createCourier(data: CreateCourierDto): Promise<Courier> {
    try {
      const { confirmPassword, email, name, password, phone, cpf } = data;

      if (password !== confirmPassword) {
        throw new UnprocessableEntityException('Passwords do not match');
      }

      const existingByCpf = await this.courierRepository.findByCpf(cpf);
      if (existingByCpf) {
        throw new ConflictException('CPF já está em uso');
      }

      const existingByEmail = await this.courierRepository.findByEmail(email);
      if (existingByEmail) {
        throw new ConflictException('Email já está em uso');
      }

      const hashedPassword = await this.hashService.hash(password);

      const newCourier = {
        name,
        email,
        phone,
        cpf,
        password: hashedPassword,
      };

      const courier = await this.courierRepository.create(newCourier);

      return courier;
    } catch (error: unknown) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar entregador');
    }
  }

  async findAll(): Promise<Courier[]> {
    return await this.courierRepository.findAll();
  }

  async findOne(id: string): Promise<Courier> {
    const courier = await this.courierRepository.findById(id);

    if (!courier) {
      throw new NotFoundException('Entregador não encontrado');
    }

    return courier;
  }

  async update(data: UpdateCourierDto): Promise<Courier> {
    const courier = await this.courierRepository.findById(data.id);

    if (!courier) {
      throw new NotFoundException('Entregador não encontrado');
    }

    return await this.courierRepository.update(data.id, data);
  }

  //   async updateLocation(data: UpdateLocationDto): Promise<Courier> {
  //     const courier = await this.courierRepository.findById(data.id);

  //     if (!courier) {
  //       throw new NotFoundException('Entregador não encontrado');
  //     }

  //     return await this.courierRepository.updateLocation(data);
  //   }

  async remove(id: string): Promise<void> {
    const courier = await this.courierRepository.findById(id);

    if (!courier) {
      throw new NotFoundException('Entregador não encontrado');
    }

    await this.courierRepository.delete(id);
  }
}
