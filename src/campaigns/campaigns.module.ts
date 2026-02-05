import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService], // Exporta para que o Pricing possa usar
})
export class CampaignsModule {}