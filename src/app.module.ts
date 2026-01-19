import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { PricingModule } from "./pricing/pricing.module";

import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

import { CategoriesModule } from "./categories/categories.module";    

import { AiModule } from "./dexter/ai.module";  


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    PricingModule, // 👈 ESSENCIAL (pricing/quote)
    AiModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,

    // 🔐 JWT global
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 🧑‍⚖️ Roles (ADMIN, STAFF, etc)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}