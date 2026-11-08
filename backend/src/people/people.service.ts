import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Person, PersonDocument } from './schemas/person.schema.js';

export type PersonResponse = {
  id: string;
  name: string;
};

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
  ) {}

  async findAll(): Promise<PersonResponse[]> {
    const people = await this.personModel.find().sort({ name: 1 }).exec();
    return people.map((person) => this.toResponse(person));
  }

  async findById(id: string): Promise<PersonResponse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid person ID');
    }

    const person = await this.personModel.findById(id).exec();
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return this.toResponse(person);
  }

  private toResponse(person: PersonDocument): PersonResponse {
    return {
      id: person._id.toString(),
      name: person.name,
    };
  }
}
