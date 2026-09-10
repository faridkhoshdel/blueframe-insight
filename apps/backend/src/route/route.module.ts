import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RouteController],
})
export class RouteModule {}
