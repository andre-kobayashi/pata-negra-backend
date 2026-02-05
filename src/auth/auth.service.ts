// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt"; // Importação mais robusta
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string, pass: string) {
    // 1. Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } // Normaliza para evitar erros de digitação
    });

    // 2. Verifica se o usuário existe e está ativo
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    if (!user.active) {
      throw new UnauthorizedException("Esta conta foi desativada pelo administrador");
    }

    // 3. Compara a senha (Hash do DB com texto plano do Front)
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Senha incorreta");
    }

    // 4. Cria o Payload (A "carga" que vai dentro do token)
    const payload = {
      sub: user.id,   // ID único do usuário
      email: user.email,
      role: user.role,
    };

    // 5. Gera o Token (accessToken)
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}