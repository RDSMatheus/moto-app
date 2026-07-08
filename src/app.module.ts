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
  ],
  providers: [PrismaService],
})
export class AppModule {}
