import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Zalo mini app API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  app.enableCors({
    origin: '*', // allowed origins
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // allow cookies if needed
  });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
