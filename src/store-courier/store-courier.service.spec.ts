import { Test, TestingModule } from '@nestjs/testing';
import { StoreCourierService } from './store-courier.service';

describe('StoreCourierService', () => {
  let service: StoreCourierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreCourierService],
    }).compile();

    service = module.get<StoreCourierService>(StoreCourierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
