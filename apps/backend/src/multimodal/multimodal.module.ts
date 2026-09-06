import { Module } from '@nestjs/common';
import { MultimodalController } from './multimodal.controller';
import { MultimodalService } from './multimodal.service';

@Module({
  controllers: [MultimodalController],
  providers: [MultimodalService],
  exports: [MultimodalService],
})
export class MultimodalModule {}
