import { Module } from '@nestjs/common';
import { StoreCourierService } from './store-courier.service';
import { StoreCourierController } from './store-courier.controller';
import { StoreCourierRepository } from './store-courier.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StoreModule } from 'src/store/store.module';
import { CourierModule } from 'src/courier/courier.module';

@Module({
  imports: [PrismaModule, StoreModule, CourierModule],
  providers: [StoreCourierService, StoreCourierRepository],
  controllers: [StoreCourierController],
  exports: [StoreCourierService],
})
export class StoreCourierModule {}
