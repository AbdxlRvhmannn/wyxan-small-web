import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitHistoryDocument = HydratedDocument<VisitHistory>;

export const VISIT_NAVIGATION_TYPES = ['go', 'jump'] as const;
export type VisitNavigationType = (typeof VISIT_NAVIGATION_TYPES)[number];

@Schema({ _id: false })
export class VisitHistoryEntry {
  @Prop()
  visitId?: string;

  @Prop({ required: true })
  entryId: string;

  @Prop({ required: true })
  address: string;

  @Prop({ trim: true })
  title?: string;

  @Prop({ required: true })
  visitedAt: Date;

  @Prop({ enum: VISIT_NAVIGATION_TYPES })
  navigationType?: VisitNavigationType;
}

const VisitHistoryEntrySchema = SchemaFactory.createForClass(VisitHistoryEntry);

@Schema({ collection: 'visit_histories' })
export class VisitHistory {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  personId: Types.ObjectId;

  @Prop({ type: [VisitHistoryEntrySchema], default: [] })
  visits: VisitHistoryEntry[];
}

export const VisitHistorySchema = SchemaFactory.createForClass(VisitHistory);

VisitHistorySchema.index({ personId: 1, 'visits.visitedAt': -1 });
