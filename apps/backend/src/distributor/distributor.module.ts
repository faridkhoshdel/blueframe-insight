import { Module } from '@nestjs/common';
import { DistributorController } from './distributor.controller';
@Module({ controllers: [DistributorController] })
export class DistributorModule {}
