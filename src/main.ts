import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
    }
  ));
  const config = new DocumentBuilder()
  .setTitle('Auth Api')
  .setDescription('Testing Login and refresh token propose')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app,config);  
  SwaggerModule.setup('docs',app,document);
  await app.listen(process.env.PORT);
}
bootstrap();
