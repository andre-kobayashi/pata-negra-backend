import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CampaignsService } from './campaigns.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from '../common/decorators/public.decorator';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  /* =========================
     🌍 PÚBLICO (LOJA)
     👉 SEM JWT
  ========================= */
  @Public()
  @Get('active')
  async findActive() {
    return this.campaignsService.getActiveCampaigns();
  }

  /* =========================
     🔒 ADMIN
  ========================= */
  @Get()
  async findAll() {
    return this.campaignsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  /* =========================
     ✅ CREATE (ADMIN)
  ========================= */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bannerDesktop', maxCount: 1 },
        { name: 'bannerMobile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/campaigns',
          filename: (req, file, cb) => {
            const unique =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${unique}${extname(
                file.originalname,
              )}`,
            );
          },
        }),
      },
    ),
  )
  async create(@Body() body: any, @UploadedFiles() files: any) {
    const data = {
      ...body,
      bannerDesktop: files?.bannerDesktop?.[0]
        ? `campaigns/${files.bannerDesktop[0].filename}`
        : null,
      bannerMobile: files?.bannerMobile?.[0]
        ? `campaigns/${files.bannerMobile[0].filename}`
        : null,
    };

    return this.campaignsService.create(data);
  }

  /* =========================
     ✅ UPDATE (ADMIN)
  ========================= */
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bannerDesktop', maxCount: 1 },
        { name: 'bannerMobile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/campaigns',
          filename: (req, file, cb) => {
            const unique =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${unique}${extname(
                file.originalname,
              )}`,
            );
          },
        }),
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: any,
  ) {
    const data: any = { ...body };

    if (files?.bannerDesktop?.[0]) {
      data.bannerDesktop = `campaigns/${files.bannerDesktop[0].filename}`;
    }

    if (files?.bannerMobile?.[0]) {
      data.bannerMobile = `campaigns/${files.bannerMobile[0].filename}`;
    }

    return this.campaignsService.update(id, data);
  }
}