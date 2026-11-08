import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ collection: 'sites', timestamps: true })
export class Site {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  address: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  html: string;

  @Prop({ default: '' })
  searchText: string;

  @Prop({ type: Types.ObjectId, index: true })
  authorId?: Types.ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.index(
  { title: 'text', searchText: 'text' },
  {
    weights: { title: 10, searchText: 1 },
    name: 'site_text_search',
  },
);
