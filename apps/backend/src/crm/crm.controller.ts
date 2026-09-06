import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CrmService } from './crm.service';
import { AiScoringService } from './ai-scoring.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('CRM & Sales')
@Controller('crm')
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly aiScoring: AiScoringService,
  ) {}

  @Post('customers')
  @HttpCode(HttpStatus.CREATED)
  createCustomer(@Body() body: any) {
    return this.crmService.createCustomer(body);
  }

  @Get('customers')
  getAllCustomers() {
    return this.crmService.getAllCustomers();
  }

  @Get('customers/:id/activities')
  @ApiOperation({ summary: 'دریافت تایم‌لاین فعالیت‌های مشتری' })
  getCustomerActivities(@Param('id') id: string) {
    return this.crmService.getCustomerActivities(id);
  }

  @Post('deals')
  @HttpCode(HttpStatus.CREATED)
  createDeal(@Body() body: any) {
    return this.crmService.createDeal(body);
  }

  @Get('deals')
  getAllDeals() {
    return this.crmService.getAllDeals();
  }

  @Get('deals/grouped')
  getDealsByStage() {
    return this.crmService.getDealsByStage();
  }

  @Put('deals/:id/stage')
  moveDealStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.crmService.moveDealStage(id, stage);
  }

  @Get('pipeline/stats')
  getPipelineStats() {
    return this.crmService.getPipelineStats();
  }

  @Get('activities/recent')
  @ApiOperation({ summary: 'دریافت فعالیت‌های اخیر همه مشتریان' })
  getRecentActivities() {
    return this.crmService.getAllActivities();
  }

  // ===== AI & Predictive Endpoints =====

  @Post('ai/lead-score/:customerId')
  @ApiOperation({ summary: 'محاسبه Lead Score با XAI' })
  calculateLeadScore(@Param('customerId') id: string) {
    return this.aiScoring.calculateLeadScore(id);
  }

  @Post('ai/churn-risk/:customerId')
  @ApiOperation({ summary: 'پیش‌بینی ریسک Churn' })
  calculateChurnRisk(@Param('customerId') id: string) {
    return this.aiScoring.calculateChurnRisk(id);
  }

  @Post('ai/analyze-all')
  @ApiOperation({ summary: 'تحلیل AI همه مشتریان' })
  analyzeAll() {
    return this.aiScoring.analyzeAllCustomers();
  }
}
