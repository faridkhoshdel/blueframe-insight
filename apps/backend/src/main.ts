import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('🔍 Environment check:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  PORT:', process.env.PORT);
  console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('  DATABASE_URL prefix:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) : 'UNDEFINED');
  console.log('  JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // گوش دادن به PORT از environment
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(parseInt(process.env.PORT || '3000', 10), '0.0.0.0');
  
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'NOT SET'}`);
}

bootstrap();
