import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExecutiveService } from './executive.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('Executive Dashboard')
@Controller('executive')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXECUTIVE, Role.ADMIN)
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get('overview')
  @ApiOperation({ summary: 'دریافت داده‌های کامل داشبورد مدیریتی' })
  getOverview() {
    return this.executiveService.getExecutiveData();
  }
}
