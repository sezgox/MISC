import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 🚫 elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // ❌ lanza error si llegan propiedades extra
      transform: true,           // 🔄 transforma el body en una instancia del DTO
      transformOptions: {
        enableImplicitConversion: true, // ⚙️ convierte tipos automáticamente (string → number)
      },
    }),
  );
  app.enableCors();
  await app.listen(3000);


}
bootstrap();
