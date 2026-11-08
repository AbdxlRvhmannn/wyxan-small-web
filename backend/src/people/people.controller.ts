import { Controller, Get, Param } from '@nestjs/common';
import { PeopleService } from './people.service.js';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  async findAll() {
    const people = await this.peopleService.findAll();
    return { people };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const person = await this.peopleService.findById(id);
    return { person };
  }
}
