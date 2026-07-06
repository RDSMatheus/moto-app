import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { CourierRepository } from './courier.repository';
import { HashModule } from 'src/common/hash/hash.module';

@Module({
  imports: [PrismaModule, HashModule],
  controllers: [CourierController],
  providers: [CourierService, CourierRepository],
  exports: [CourierService, CourierRepository],
})
export class CourierModule {}
