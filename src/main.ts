import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser'; 
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. COOKIE PARSER
  app.use(cookieParser());

  // 2. CONFIGURAÇÃO DE CORS (Única e Completa)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // 3. SERVIR ARQUIVOS ESTÁTICOS (O Segredo para ver as fotos)
  // Como o Service salva em process.cwd() + 'uploads', precisamos expor essa pasta
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', // As imagens serão acessadas via http://localhost:4000/uploads/...
  });

  // 4. VALIDATION PIPES (Único com transformações inteligentes)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true, // Necessário para converter strings de FormData para Numbers
      },
    }),
  );

  // 5. PORTA 4000
  await app.listen(4000);
  console.log(`🚀 Backend Pata Negra rodando em: http://localhost:4000`);
  console.log(`📸 Imagens disponíveis em: http://localhost:4000/uploads/products/...`);
}
bootstrap();