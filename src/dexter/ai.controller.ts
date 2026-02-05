// backend/src/dexter/ai.controller.ts
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
// import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards() // 🔒 depois você liga o JwtAuthGuard
@Controller("admin/ai")
export class AiController {
  private readonly openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY não encontrada no .env");
      throw new Error("OPENAI_API_KEY não configurada");
    }

    this.openai = new OpenAI({ apiKey });
  }

  @Post("generate-description")
  async generateDescription(
    @Body() body: { topic?: string; type?: "category" | "product" },
  ) {
    const { topic, type } = body;

    if (!topic || !type) {
      throw new BadRequestException("Campos 'topic' e 'type' são obrigatórios");
    }

    try {
      const prompt = `
Atue como Dexter, especialista em SEO e Copywriting premium da marca Pata Negra.

Crie conteúdo para ${type === "category" ? "uma CATEGORIA" : "um PRODUTO"} chamado:
"${topic}"

TOM:
- Alta gastronomia
- Exclusividade
- Sofisticação
- Confiança

RETORNE APENAS JSON NO FORMATO EXATO:
{
  "description": "Descrição persuasiva em até 3 parágrafos",
  "seoTitle": "Título SEO com até 60 caracteres",
  "seoDescription": "Meta description com até 150 caracteres"
}
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um assistente de e-commerce premium e responde apenas JSON válido.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;

      if (!content) {
        throw new InternalServerErrorException("Resposta vazia da OpenAI");
      }

      return JSON.parse(content);

    } catch (error: any) {
      console.warn("⚠️ OpenAI indisponível ou erro:", error?.message);

      // 🔁 FALLBACK AUTOMÁTICO (não quebra o admin)
      return {
        description: `Descubra a excelência da linha ${topic} da Pata Negra. Cada produto é cuidadosamente selecionado para oferecer uma experiência gastronômica sofisticada, combinando tradição, sabor intenso e qualidade premium.`,
        seoTitle: `${topic} Premium | Pata Negra`,
        seoDescription: `Compre ${topic} premium da Pata Negra. Alta gastronomia, qualidade superior e entrega garantida.`,
      };
    }
  }
}