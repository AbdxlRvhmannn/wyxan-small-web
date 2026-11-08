import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ collection: 'sites' })
export class Site {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  address: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  html: string;
}

export const SiteSchema = SchemaFactory.createForClass(Site);
