import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { DatabaseModule } from './database/database.module.js';
import { NavigationModule } from './navigation/navigation.module.js';
import { PeopleModule } from './people/people.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    DatabaseModule,
    PeopleModule,
    NavigationModule,
  ],
})
export class AppModule {}
