import { Test, TestingModule } from '@nestjs/testing';
import { StoreCourierController } from './store-courier.controller';

describe('StoreCourierController', () => {
  let controller: StoreCourierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreCourierController],
    }).compile();

    controller = module.get<StoreCourierController>(StoreCourierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
