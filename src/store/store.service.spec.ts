import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { StoreRepository } from './store.repository';
import { HashService } from 'src/common/hash/hash.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateStoreDto } from './dtos/create-store.dto';

describe('StoreService', () => {
  let service: StoreService;
  let storeRepository: Partial<Record<keyof StoreRepository, jest.Mock>>;
  let hashService: Partial<Record<keyof HashService, jest.Mock>>;

  beforeEach(async () => {
    storeRepository = {
      findByEmail: jest.fn(),
      findByCpfCnpj: jest.fn(),
      createStoreWithTenant: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    hashService = {
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: StoreRepository, useValue: storeRepository },
        { provide: HashService, useValue: hashService },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStore', () => {
    const createStoreDto: CreateStoreDto = {
      name: 'Test Store',
      address: 'Test Address',
      phone: '123456789',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      cpfCnpj: '12345678900',
    };

    it('should throw UnprocessableEntityException if passwords do not match', async () => {
      const dto = { ...createStoreDto, confirmPassword: 'different_password' };

      await expect(service.createStore(dto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(storeRepository.findByEmail).not.toHaveBeenCalled();
      expect(storeRepository.findByCpfCnpj).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      (storeRepository.findByEmail as jest.Mock).mockResolvedValue({ id: '1' });
      (storeRepository.findByCpfCnpj as jest.Mock).mockResolvedValue(null);

      await expect(service.createStore(createStoreDto)).rejects.toThrow(
        ConflictException,
      );
      expect(storeRepository.createStoreWithTenant).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if CPF/CNPJ already exists', async () => {
      (storeRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (storeRepository.findByCpfCnpj as jest.Mock).mockResolvedValue({
        id: '1',
      });

      await expect(service.createStore(createStoreDto)).rejects.toThrow(
        ConflictException,
      );
      expect(storeRepository.createStoreWithTenant).not.toHaveBeenCalled();
    });

    it('should create a store successfully', async () => {
      const hashedPassword = 'hashed_password';
      const createdStore = { id: '1', ...createStoreDto };

      (storeRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (storeRepository.findByCpfCnpj as jest.Mock).mockResolvedValue(null);
      (hashService.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (storeRepository.createStoreWithTenant as jest.Mock).mockResolvedValue({
        store: createdStore,
      });

      const result = await service.createStore(createStoreDto);

      expect(hashService.hash).toHaveBeenCalledWith(createStoreDto.password);
      expect(storeRepository.createStoreWithTenant).toHaveBeenCalledWith({
        address: createStoreDto.address,
        name: createStoreDto.name,
        cpfCnpj: createStoreDto.cpfCnpj,
        email: createStoreDto.email,
        password: hashedPassword,
        phone: createStoreDto.phone,
      });
      expect(result).toEqual(createdStore);
    });

    it('should throw BadRequestException if other errors occur', async () => {
      (storeRepository.findByEmail as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.createStore(createStoreDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a store if found', async () => {
      const store = { id: '1', name: 'Store' };
      (storeRepository.findByEmail as jest.Mock).mockResolvedValue(store);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(store);
      expect(storeRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return null if not found', async () => {
      (storeRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      const stores = [{ id: '1' }, { id: '2' }];
      (storeRepository.findAll as jest.Mock).mockResolvedValue(stores);

      const result = await service.findAll();

      expect(result).toEqual(stores);
      expect(storeRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a store if found', async () => {
      const store = { id: '1', name: 'Store' };
      (storeRepository.findById as jest.Mock).mockResolvedValue(store);

      const result = await service.findOne('1');

      expect(result).toEqual(store);
      expect(storeRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if store not found', async () => {
      (storeRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a store if found', async () => {
      const store = { id: '1', name: 'Old Name' };
      const updateData = { id: '1', name: 'New Name' };
      const updatedStore = { ...store, name: 'New Name' };

      (storeRepository.findById as jest.Mock).mockResolvedValue(store);
      (storeRepository.update as jest.Mock).mockResolvedValue(updatedStore);

      const result = await service.update(updateData);

      expect(result).toEqual(updatedStore);
      expect(storeRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw NotFoundException if store not found', async () => {
      (storeRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update({ id: '1', name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(storeRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a store if found', async () => {
      const store = { id: '1', name: 'Store' };
      const deletedStore = { ...store };

      (storeRepository.findById as jest.Mock).mockResolvedValue(store);
      (storeRepository.delete as jest.Mock).mockResolvedValue(deletedStore);

      const result = await service.remove('1');

      expect(result).toEqual(deletedStore);
      expect(storeRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if store not found', async () => {
      (storeRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      expect(storeRepository.delete).not.toHaveBeenCalled();
    });
  });
});
