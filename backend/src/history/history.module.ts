import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeopleModule } from '../people/people.module.js';
import { NavigationModule } from '../navigation/navigation.module.js';
import {
  VisitHistory,
  VisitHistorySchema,
} from '../navigation/schemas/visit-history.schema.js';
import { HistoryController } from './history.controller.js';
import { HistoryService } from './history.service.js';

@Module({
  imports: [
    PeopleModule,
    NavigationModule,
    MongooseModule.forFeature([
      { name: VisitHistory.name, schema: VisitHistorySchema },
    ]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
