// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // Necessário para arquivos estáticos
import cookieParser from 'cookie-parser'; 
import { join } from 'path';

async function bootstrap() {
  // Alteramos para NestExpressApplication para habilitar o .useStaticAssets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. HABILITAR CORS
  app.enableCors({
    origin: 'http://localhost:3000', // URL do seu Admin
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // 2. COOKIE PARSER
  app.use(cookieParser());

  // 3. SERVIR ARQUIVOS ESTÁTICOS (Essencial para ver as fotos WebP)
  // Isso fará com que http://localhost:4000/uploads/foto.webp funcione
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // 4. VALIDATION PIPES
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // 5. SERVIR IMAGENS ESTÁTICAS
  app.useStaticAssets(join(process.cwd(), "public"), {
    prefix: "/",
  });

  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 6. PORTA 4000
  await app.listen(4000);
  console.log(`🚀 Backend Pata Negra rodando em: http://localhost:4000`);
}
bootstrap();