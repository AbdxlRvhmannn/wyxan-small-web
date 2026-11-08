import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitHistoryDocument = HydratedDocument<VisitHistory>;

@Schema({ _id: false })
export class VisitHistoryEntry {
  @Prop({ required: true })
  entryId: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  visitedAt: Date;
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
