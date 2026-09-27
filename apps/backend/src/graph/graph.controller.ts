import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GraphService } from './graph.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('Knowledge Graph')
@Controller('graph')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get('full')
  @ApiOperation({ summary: 'دریافت گراف کامل' })
  getFullGraph() {
    return this.graphService.buildGraph();
  }

  @Get('customer/:id/network')
  @ApiOperation({ summary: 'تحلیل شبکه یک مشتری' })
  getCustomerNetwork(@Param('id') id: string) {
    return this.graphService.analyzeCustomerNetwork(id);
  }
}
