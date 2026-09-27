import { GraphService } from './graph.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Controller, Get, Param } from '@nestjs/common';
@ApiTags('Knowledge Graph')
@Controller('graph')
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
