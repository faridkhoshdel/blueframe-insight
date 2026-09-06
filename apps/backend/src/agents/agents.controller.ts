import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Autonomous Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('run-all')
  @ApiOperation({ summary: 'اجرای همه Agent ها' })
  runAll() {
    return this.agentsService.runAllAgents();
  }

  @Post('retention')
  @ApiOperation({ summary: 'اجرای Retention Agent' })
  runRetention() {
    return this.agentsService.runRetentionAgent();
  }

  @Post('nurture')
  @ApiOperation({ summary: 'اجرای Nurture Agent' })
  runNurture() {
    return this.agentsService.runNurtureAgent();
  }

  @Post('cross-sell')
  @ApiOperation({ summary: 'اجرای Cross-sell Agent' })
  runCrossSell() {
    return this.agentsService.runCrossSellAgent();
  }

  @Post('follow-up')
  @ApiOperation({ summary: 'اجرای Follow-up Agent' })
  runFollowUp() {
    return this.agentsService.runFollowUpAgent();
  }

  @Get('logs')
  @ApiOperation({ summary: 'دریافت log فعالیت‌ها' })
  getLogs(@Query('limit') limit?: number, @Query('type') type?: string) {
    return this.agentsService.getAgentLogs(limit || 50, type);
  }

  @Get('stats')
  @ApiOperation({ summary: 'آمار Agent ها' })
  getStats() {
    return this.agentsService.getAgentStats();
  }
}
