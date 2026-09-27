import { ExecutiveService } from './executive.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Controller, Get } from '@nestjs/common';
@ApiTags('Executive Dashboard')
@Controller('executive')
@Roles(Role.EXECUTIVE, Role.ADMIN)
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get('overview')
  @ApiOperation({ summary: 'دریافت داده‌های کامل داشبورد مدیریتی' })
  getOverview() {
    return this.executiveService.getExecutiveData();
  }
}
