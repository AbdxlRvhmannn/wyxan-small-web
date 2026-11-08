import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { NavigationActionBody } from './navigation.service.js';
import { NavigationService } from './navigation.service.js';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get('current')
  async current(@Query('personId') personId: string) {
    return this.navigationService.current(personId);
  }

  @Post('go')
  async go(@Body() body: NavigationActionBody) {
    return this.navigationService.go(body);
  }

  @Post('back')
  async back(@Body() body: NavigationActionBody) {
    return this.navigationService.back(body);
  }

  @Post('forward')
  async forward(@Body() body: NavigationActionBody) {
    return this.navigationService.forward(body);
  }
}
