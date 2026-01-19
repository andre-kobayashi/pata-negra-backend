// backend/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>("JWT_SECRET");
    
    // DEBUG: Veja se aparece no terminal do VS Code do Backend
    console.log("JWT_STRATEGY_SECRET_CHECK:", secret ? "✅ Carregado" : "❌ VAZIO!");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Se o AuthService envia 'sub', o payload terá 'sub'
    return { userId: payload.sub, email: payload.email };
  }
}