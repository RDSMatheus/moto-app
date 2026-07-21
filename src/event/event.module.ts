import { forwardRef, Module } from '@nestjs/common';
import { EventsGateway } from './event.gatewaty';
import { EventService } from './event.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrderModule } from 'src/order/order.module';
import { CourierModule } from 'src/courier/courier.module';

@Module({
  providers: [EventsGateway, EventService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    PrismaModule,
    OrderModule,
    CourierModule,
  ],
  exports: [EventsGateway],
})
export class EventModule {}
