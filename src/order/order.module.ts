import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrderRepository } from './order.repository';
import { StoreModule } from 'src/store/store.module';
import { CourierModule } from 'src/courier/courier.module';

@Module({
  imports: [PrismaModule, StoreModule, CourierModule],
  providers: [OrderService, OrderRepository],
  controllers: [OrderController],
})
export class OrderModule {}
