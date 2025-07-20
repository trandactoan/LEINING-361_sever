import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Zalo mini app API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:4200',
        'https://h5.zdn.vn',
        'https://leiningwebadmin.netlify.app',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS for ${origin}`), false);
      }
    },
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(express.static('/var/www/app/public'));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
