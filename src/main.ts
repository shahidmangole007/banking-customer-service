import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalFilter } from './customer/ExceptionFilter/global/global.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


    app.useGlobalPipes(
    new ValidationPipe({
      whitelist : true,
      forbidNonWhitelisted : true,
      transform : true,
      transformOptions :{
          enableImplicitConversion: false
      }
    })
  )

    // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Banking Customer Service API')
    .setDescription('API docs for Customer Service ')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // app.useLogger(app.get(Logger))


  //versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(new GlobalFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
