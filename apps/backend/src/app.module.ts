import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SentimentModule } from './sentiment/sentiment.module';
import { InventoryModule } from './inventory/inventory.module';
import { CrmModule } from './crm/crm.module';
import { SeedModule } from './seed/seed.module';
import { GraphModule } from './graph/graph.module';
import { SimulatorModule } from './simulator/simulator.module';
import { AgentsModule } from './agents/agents.module';
import { MultimodalModule } from './multimodal/multimodal.module';
import { ExecutiveModule } from './executive/executive.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [SentimentModule, InventoryModule, CrmModule, SeedModule, GraphModule, SimulatorModule, AgentsModule, MultimodalModule, AuthModule, ExecutiveModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
