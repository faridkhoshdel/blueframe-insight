import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS ساده برای محیط توسعه (پذیرش همه origin ها)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validation Pipe سراسری
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('blueFrame Insight API')
    .setDescription('API جامع تحلیل احساسات، مدیریت انبار و CRM')
    .setVersion('1.0')
    .addTag('Sentiment', 'تحلیل احساسات فارسی')
    .addTag('Inventory', 'مدیریت انبار')
    .addTag('CRM & Sales', 'مدیریت مشتریان و فروش')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 50001;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
