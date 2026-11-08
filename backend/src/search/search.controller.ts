import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service.js';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.searchService.search(q, limit, page);
  }
}
