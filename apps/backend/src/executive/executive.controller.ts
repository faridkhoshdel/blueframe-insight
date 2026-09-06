import { Controller, Get } from '@nestjs/common';
import { ExecutiveService } from './executive.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Executive Dashboard')
@Controller('executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get('overview')
  @ApiOperation({ summary: 'دریافت داده‌های کامل داشبورد مدیریتی' })
  getOverview() {
    return this.executiveService.getExecutiveData();
  }
}
