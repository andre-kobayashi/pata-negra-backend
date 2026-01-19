import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  BadRequestException,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { Public } from "../common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
@Post("login")
async login(
  @Body() body: { email?: string; password?: string },
  @Res({ passthrough: true }) res: Response,
) {
  const { email, password } = body;

  if (!email || !password) {
    throw new BadRequestException("Email e senha são obrigatórios");
  }

  const result = await this.authService.login(email, password);
// Mantemos o cookie para compatibilidade com Middleware
  res.cookie("token", result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true em produção
    path: "/",
    maxAge: 86400 * 1000, // 24 horas
  });

  // MUDANÇA AQUI: Retornamos o objeto completo (user + accessToken)
  // Agora o frontend vai encontrar o data.accessToken
  return result; 
}

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("token", { path: "/" });
    return { success: true };
  }

  @Get("me")
me(@Req() req: Request) {
  return (req as any).user;
}
}