import { Controller, Post, Body } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private svc: CustomerAuthService) {}

  @Post('request-otp')
  requestOtp(@Body() body: { phoneOrNationalId: string }) {
    return this.svc.requestOtp(body.phoneOrNationalId);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { phone: string; code: string }) {
    return this.svc.verifyOtp(body.phone, body.code);
  }
}
