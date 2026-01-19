// backend/src/dexter/ai.module.ts
import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { ConfigModule } from "@nestjs/config"; // Adicione este import

@Module({
  imports: [ConfigModule], // ADICIONE ISSO AQUI
  controllers: [AiController],
})
export class AiModule {}