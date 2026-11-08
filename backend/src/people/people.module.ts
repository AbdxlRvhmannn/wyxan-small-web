import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './schemas/person.schema.js';
import { PeopleController } from './people.controller.js';
import { PeopleService } from './people.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
  ],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
