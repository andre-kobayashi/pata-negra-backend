// backend/src/categories/categories.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

// Constante global
const prisma = new PrismaClient();

@Injectable()
export class CategoriesService {
  async create(data: any) {
    // REMOVIDO O 'this.' pois prisma é uma constante externa
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        image: data.image,
        active: data.active,
        sort: data.sort,
        // Garante que o parentId seja nulo se vier vazio
        parentId: data.parentId || null,
      },
    });
  }

  findAll() {
    return prisma.category.findMany({
      // Removi o filtro de active:true para você conseguir ver todas no Admin
      // inclusive as inativas para poder editá-las
      include: {
        children: true,
      },
      orderBy: { sort: "asc" },
    });
  }

  findOne(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
  }

  async update(id: string, data: UpdateCategoryDto & { image?: string }) {
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        // Garante que se parentId for string vazia, vire null no banco
        parentId: data.parentId || null,
        ...(data.image && { image: data.image }),
      },
    });
  }

  remove(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}