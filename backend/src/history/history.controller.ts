import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { HistoryJumpBody } from './history.service.js';
import { HistoryService } from './history.service.js';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':personId')
  async list(
    @Param('personId') personId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.historyService.list(personId, limit, cursor);
  }

  @Post(':personId/jump')
  async jump(@Param('personId') personId: string, @Body() body: HistoryJumpBody) {
    return this.historyService.jump(personId, body);
  }
}
