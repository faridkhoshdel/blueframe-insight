import { Module } from '@nestjs/common';
import { DistributorController } from './distributor.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DistributorController],
})
export class DistributorModule {}
