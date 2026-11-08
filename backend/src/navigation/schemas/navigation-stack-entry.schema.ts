import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class WebsiteSnapshot {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  html: string;
}

export const WebsiteSnapshotSchema =
  SchemaFactory.createForClass(WebsiteSnapshot);

@Schema({ _id: false })
export class NavigationStackEntry {
  @Prop({ required: true })
  entryId: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: WebsiteSnapshotSchema, required: true })
  website: WebsiteSnapshot;

  @Prop({ default: 0 })
  scrollY: number;
}

export const NavigationStackEntrySchema =
  SchemaFactory.createForClass(NavigationStackEntry);
