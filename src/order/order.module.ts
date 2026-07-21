import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrderRepository } from './order.repository';
import { StoreModule } from 'src/store/store.module';
import { CourierModule } from 'src/courier/courier.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StoreCourierModule } from 'src/store-courier/store-courier.module';
import { GeocodingModule } from 'src/geocoding/geocoding.module';

@Module({
  imports: [
    PrismaModule,
    StoreModule,
    CourierModule,
    EventEmitterModule,
    StoreCourierModule,
    GeocodingModule,
  ],
  providers: [OrderService, OrderRepository],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
