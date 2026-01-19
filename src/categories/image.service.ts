// src/categories/image.service.ts
import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class CategoryImageService {
  // Recomendado salvar em public para o Admin conseguir ler a foto
  private uploadPath = path.resolve("public/uploads/categories");

  constructor() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async processImage(fileBuffer: Buffer): Promise<string> {
    const fileName = `${uuidv4()}.webp`;
    const fullPath = path.join(this.uploadPath, fileName);

    await sharp(fileBuffer)
      .rotate() // Corrige fotos viradas de celular
      .resize(1000, 1000, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(fullPath);

    // Retorna o caminho que será salvo no Banco de Dados
    return `/uploads/categories/${fileName}`;
  }
}