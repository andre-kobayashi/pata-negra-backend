import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ cookies (login)
  app.use(cookieParser());

  // ✅ CORS para o admin
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
  });

  // ✅ validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(4000);
}
bootstrap();