import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
