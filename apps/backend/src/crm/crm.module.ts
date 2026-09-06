import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { AiScoringService } from './ai-scoring.service';

@Module({
  controllers: [CrmController],
  providers: [CrmService, AiScoringService],
  exports: [CrmService, AiScoringService],
})
export class CrmModule {}
