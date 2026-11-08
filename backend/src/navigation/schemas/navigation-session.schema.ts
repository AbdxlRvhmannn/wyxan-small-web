import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  NavigationStackEntry,
  NavigationStackEntrySchema,
} from './navigation-stack-entry.schema.js';

export type NavigationSessionDocument = HydratedDocument<NavigationSession>;

@Schema({ collection: 'navigation_sessions' })
export class NavigationSession {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  personId: Types.ObjectId;

  @Prop({ type: [NavigationStackEntrySchema], default: [] })
  stack: NavigationStackEntry[];

  @Prop({ default: -1 })
  currentIndex: number;
}

export const NavigationSessionSchema =
  SchemaFactory.createForClass(NavigationSession);
