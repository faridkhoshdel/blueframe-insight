import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test.module';
import { SentimentModule } from './sentiment/sentiment.module';
import { InventoryModule } from './inventory/inventory.module';
import { CrmModule } from './crm/crm.module';
import { SeedModule } from './seed/seed.module';
import { GraphModule } from './graph/graph.module';
import { SimulatorModule } from './simulator/simulator.module';
import { AgentsModule } from './agents/agents.module';
import { MultimodalModule } from './multimodal/multimodal.module';
import { AuthModule } from './auth/auth.module';
import { ExecutiveModule } from './executive/executive.module';
import { InvoiceModule } from './invoice/invoice.module';
import { RouteModule } from './route/route.module';
import { DistributorModule } from './distributor/distributor.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { DemoModule } from './demo/demo.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    TestModule,
    SentimentModule,
    InventoryModule,
    CrmModule,
    SeedModule,
    GraphModule,
    SimulatorModule,
    AgentsModule,
    MultimodalModule,
    AuthModule,
    ExecutiveModule,
    InvoiceModule,
    RouteModule,
    DistributorModule,
    CustomerAuthModule,
    DemoModule,
    DiagnosticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
