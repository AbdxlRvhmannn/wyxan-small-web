import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeopleModule } from '../people/people.module.js';
import { Site, SiteSchema } from '../sites/schemas/site.schema.js';
import { NavigationController } from './navigation.controller.js';
import { NavigationService } from './navigation.service.js';

@Module({
  imports: [
    PeopleModule,
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
