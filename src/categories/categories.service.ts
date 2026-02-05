import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {} // ✅ CORRETO

  /* =========================
     CREATE
  ========================= */
  async create(data: CreateCategoryDto & { image?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        image: data.image,
        active: data.active,
        sort: data.sort,
        parentId: data.parentId || null,
      },
    });
  }

  /* =========================
     ADMIN – LISTAGEM COMPLETA
  ========================= */
  findAll() {
    return this.prisma.category.findMany({
      include: {
        children: true,
      },
      orderBy: { sort: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
  }

  /* =========================
     🌍 STORE – LISTAGEM PÚBLICA
  ========================= */
  async findAllPublic() {
    return this.prisma.category.findMany({
      where: {
        active: true,
      },
      orderBy: { sort: "asc" },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  /* =========================
     UPDATE
  ========================= */
  async update(id: string, data: UpdateCategoryDto & { image?: string }) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        parentId: data.parentId || null,
        ...(data.image && { image: data.image }),
      },
    });
  }

  /* =========================
     DELETE
  ========================= */
  remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}