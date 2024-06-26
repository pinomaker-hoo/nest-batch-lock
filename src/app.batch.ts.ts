// ** Nest Imports
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

// ** Redis Imports
import { BatchLock } from '../libs/my-library/src/batch-lock.decorator';

@Injectable()
export default class AppBatch {
  @Cron(CronExpression.EVERY_10_SECONDS)
  public async appBatch() {
    this.run();
  }

  @BatchLock({ name: 'Lock', ttl: 5 })
  public run() {
    console.log('RUN');
  }
}
