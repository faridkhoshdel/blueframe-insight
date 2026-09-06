import { Controller, Get, Param } from '@nestjs/common';
import { GraphService } from './graph.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Knowledge Graph')
@Controller('graph')
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
