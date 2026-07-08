import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { StoreModule } from 'src/store/store.module';
import { HashModule } from 'src/common/hash/hash.module';
import { CourierModule } from 'src/courier/courier.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  imports: [JwtModule, StoreModule, HashModule, CourierModule],
  exports: [AuthService],
})
export class AuthModule {}
