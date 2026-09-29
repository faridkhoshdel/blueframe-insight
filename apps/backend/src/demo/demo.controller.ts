import { Controller, Get } from '@nestjs/common';
import { DemoService } from './demo.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Public()
  @Get('info')
  getInfo() {
    return this.demoService.getInfo();
  }
}
