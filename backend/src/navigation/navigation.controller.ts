import { Body, Controller, Post } from '@nestjs/common';
import type { NavigationGoBody } from './navigation.service.js';
import { NavigationService } from './navigation.service.js';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post('go')
  async go(@Body() body: NavigationGoBody) {
    const result = await this.navigationService.go(body);
    return result;
  }
}
