import { SimulatorService } from './simulator.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Body, Controller, Param, Post } from '@nestjs/common';
@ApiTags('Digital Twin Simulator')
@Controller('simulator')
@Roles(Role.ADMIN)
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post('price-change')
  @ApiOperation({ summary: 'شبیه‌سازی تغییر قیمت' })
  simulatePriceChange(@Body('percent') percent: number) {
    return this.simulatorService.simulatePriceChange(percent);
  }

  @Post('customer-loss/:customerId')
  @ApiOperation({ summary: 'شبیه‌سازی از دست دادن مشتری' })
  simulateCustomerLoss(@Param('customerId') customerId: string) {
    return this.simulatorService.simulateCustomerLoss(customerId);
  }

  @Post('marketing-campaign')
  @ApiOperation({ summary: 'شبیه‌سازی کمپین بازاریابی' })
  simulateMarketingCampaign(
    @Body('segment') segment: string,
    @Body('budget') budget: number,
  ) {
    return this.simulatorService.simulateMarketingCampaign(segment, budget);
  }

  @Post('compare')
  @ApiOperation({ summary: 'مقایسه چند سناریو' })
  compareScenarios(@Body('scenarios') scenarios: any[]) {
    return this.simulatorService.compareScenarios(scenarios);
  }
}
