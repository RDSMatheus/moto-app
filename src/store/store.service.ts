import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { StoreRepository } from './store.repository';
import { CreateStoreDto } from './dtos/create-store.dto';
import { Store } from '@prisma/client';
import { NewStore } from './entity/store.entity';
import { HashService } from 'src/common/hash/hash.service';
import { GeocodingService } from 'src/geocoding/geocoding.service';

export interface UpdateStoreDto {
  id: string;
  name?: string;
  address?: string;
  phone?: string;
  refreshToken?: string;
  email?: string;
  password?: string;
  cpfCpnj?: string;
}

@Injectable()
export class StoreService {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly hashService: HashService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async createStore(storeData: CreateStoreDto): Promise<Store> {
    try {
      const {
        name,
        phone,
        email,
        password,
        confirmPassword,
        cpfCnpj,
        neighborhood,
        number,
        state,
        complement,
        street,
        city,
        zipCode,
      } = storeData;

      const { latitude, longitude } =
        await this.geocodingService.geocodeAddress({
          neighborhood,
          number,
          state,
          city,
          zipCode,
          street,
        });

      if (password !== confirmPassword) {
        throw new UnprocessableEntityException('Passwords do not match');
      }

      const existingByEmail = await this.storeRepository.findByEmail(email);
      if (existingByEmail) {
        throw new ConflictException('Email já está em uso');
      }

      const existingByCpfCnpj =
        await this.storeRepository.findByCpfCnpj(cpfCnpj);
      console.log(existingByCpfCnpj);

      if (existingByCpfCnpj) {
        throw new ConflictException('CPF/CNPJ já está em uso');
      }

      const hashedPassword = await this.hashService.hash(password);

      const newStore: NewStore = {
        neighborhood,
        number,
        state,
        city,
        zipCode,
        street,
        complement,
        name,
        cpfCnpj,
        email,
        password: hashedPassword,
        phone,
        latitude,
        longitude,
      };

      const { store } =
        await this.storeRepository.createStoreWithTenant(newStore);
      return store;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create store');
    }
  }

  async findByEmail(email: string): Promise<Store | null> {
    const store = await this.storeRepository.findByEmail(email);
    return store;
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.findAll();
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findById(id);

    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }

    return store;
  }

  async update(data: UpdateStoreDto): Promise<Store> {
    const store = await this.storeRepository.findById(data.id);

    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }

    return this.storeRepository.update(data.id, data);
  }

  async remove(id: string): Promise<Store> {
    const store = await this.storeRepository.findById(id);

    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }

    return this.storeRepository.delete(id);
  }
}
