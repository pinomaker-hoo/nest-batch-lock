// ** Nest Imports
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscoveryModule } from '@nestjs/core';

// ** Redis Imports
import { RedisModule } from '@liaoliaots/nestjs-redis';

// ** Custom Module Imports
import { BatchLockProvider } from './batch-lock.provider';
import AppBatch from './app.batch.ts';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DiscoveryModule,
    RedisModule.forRoot({
      readyLog: true,
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [],
  providers: [AppBatch, BatchLockProvider],
})
export class AppModule {}
