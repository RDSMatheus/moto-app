import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreRepository } from './store.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { HashModule } from 'src/common/hash/hash.module';
import { AuthGuardModule } from 'src/common/guards/auth.guard.module';

@Module({
  imports: [PrismaModule, HashModule, AuthGuardModule],
  controllers: [StoreController],
  providers: [StoreService, StoreRepository],
  exports: [StoreService, StoreRepository],
})
export class StoreModule {}
