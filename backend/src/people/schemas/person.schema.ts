import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ collection: 'people', timestamps: true })
export class Person {
  @Prop({ required: true, trim: true })
  name: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
