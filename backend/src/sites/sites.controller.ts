import { Body, Controller, Post } from '@nestjs/common';
import { SitesService } from './sites.service.js';
import type { PublishSiteBody } from './sites.service.js';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  async publish(@Body() body: PublishSiteBody) {
    return this.sitesService.publish(body);
  }
}
