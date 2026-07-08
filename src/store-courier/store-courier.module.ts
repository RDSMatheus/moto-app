import { Module } from '@nestjs/common';
import { StoreCourierService } from './store-courier.service';
import { StoreCourierController } from './store-courier.controller';
import { StoreCourierRepository } from './store-courier.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StoreCourierService, StoreCourierRepository],
  controllers: [StoreCourierController],
})
export class StoreCourierModule {}
