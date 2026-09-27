import { Public } from '../common/decorators/public.decorator';
import { CustomerAuthService } from './customer-auth.service';
import { Body, Controller, Post } from '@nestjs/common';
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private svc: CustomerAuthService) {}

  @Public()
  @Post('request-otp')
  requestOtp(@Body() body: { phoneOrNationalId: string }) {
    return this.svc.requestOtp(body.phoneOrNationalId);
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() body: { phone: string; code: string }) {
    return this.svc.verifyOtp(body.phone, body.code);
  }
}
