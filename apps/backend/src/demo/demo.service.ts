import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoService {
  getInfo() {
    return {
      demoMode: process.env.DEMO_MODE === 'true',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      features: {
        rbac: true,
        ai: true,
        analytics: true,
      },
    };
  }
}
