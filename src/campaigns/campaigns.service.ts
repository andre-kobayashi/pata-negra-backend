import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  /* =========================
     🔓 CAMPANHAS ATIVAS (PÚBLICO / LOJA)
     - WEEKLY: dia da semana
     - DATE_RANGE: entre datas
  ========================= */
  async getActiveCampaigns() {
    const now = new Date();
    const today = now.getDay(); // 0-6 (Domingo = 0)

    return this.prisma.campaign.findMany({
      where: {
        active: true,
        OR: [
          {
            // Campanhas semanais
            type: 'WEEKLY',
            dayOfWeek: today,
          },
          {
            // Campanhas por período
            type: 'DATE_RANGE',
            startDate: { lte: now },
            endDate: { gte: now },
          },
        ],
      },
      include: {
        products: true,
        categories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* =========================
     ADMIN
  ========================= */
  async findAll() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    try {
      // 🔒 Slug único
      const existing = await this.prisma.campaign.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new BadRequestException(
          `O slug '${data.slug}' já está em uso.`,
        );
      }

      const payload = this.buildPayload(data);

      return await this.prisma.campaign.create({
        data: payload,
      });
    } catch (error) {
      console.error('ERRO CREATE CAMPAIGN:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Erro ao criar campanha.',
      );
    }
  }

  async update(id: string, data: any) {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        throw new BadRequestException('Campanha não encontrada.');
      }

      // 🔒 Valida slug sem colidir com ela mesma
      if (data.slug) {
        const slugExists = await this.prisma.campaign.findUnique({
          where: { slug: data.slug },
        });

        if (slugExists && slugExists.id !== id) {
          throw new BadRequestException(
            `O slug '${data.slug}' já está em uso.`,
          );
        }
      }

      const payload = this.buildPayload(data);

      return await this.prisma.campaign.update({
        where: { id },
        data: payload,
      });
    } catch (error) {
      console.error('ERRO UPDATE CAMPAIGN:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Erro ao atualizar campanha.',
      );
    }
  }

  /* =========================
     🔥 CONVERSÃO DE TIPOS
     (create + update)
  ========================= */
  private buildPayload(data: any) {
    const payload: any = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      type: data.type, // WEEKLY | DATE_RANGE
      themeColor: data.themeColor || '#000000',
      bannerDesktop: data.bannerDesktop || null,
      bannerMobile: data.bannerMobile || null,
      active: String(data.active) === 'true',
    };

    if (data.type === 'WEEKLY') {
      payload.dayOfWeek = data.dayOfWeek !== undefined
        ? parseInt(String(data.dayOfWeek), 10)
        : null;
      payload.startDate = null;
      payload.endDate = null;
    } else {
      payload.startDate = data.startDate
        ? new Date(data.startDate)
        : null;
      payload.endDate = data.endDate
        ? new Date(data.endDate)
        : null;
      payload.dayOfWeek = null;
    }

    return payload;
  }
}