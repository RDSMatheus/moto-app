import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { HashModule } from './common/hash/hash.module';
import { AuthGuardModule } from './common/guards/auth.guard.module';
import { JwtConfigModule } from './common/jwt/jwt-config.module';
import { CourierModule } from './courier/courier.module';
import { StoreCourierModule } from './store-courier/store-courier.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { EventModule } from './event/event.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GeocodingModule } from './geocoding/geocoding.module';

@Module({
  imports: [
    StoreModule,
    PrismaModule,
    HashModule,
    AuthGuardModule,
    JwtConfigModule,
    CourierModule,
    StoreCourierModule,
    AuthModule,
    OrderModule,
    EventModule,
    EventEmitterModule.forRoot(),
    GeocodingModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
