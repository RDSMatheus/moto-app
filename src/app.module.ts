import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { HashModule } from './common/hash/hash.module';
import { AuthGuardModule } from './common/guards/auth.guard.module';
import { JwtConfigModule } from './common/jwt/jwt-config.module';
import { CourierModule } from './courier/courier.module';

@Module({
  imports: [
    StoreModule,
    PrismaModule,
    HashModule,
    AuthGuardModule,
    JwtConfigModule,
    CourierModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
