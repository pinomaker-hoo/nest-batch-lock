import { SetMetadata, applyDecorators } from '@nestjs/common';

export const BATCH_LOCK = 'BATCH_LOCK';

export interface BatchLockType {
  name: string;
  ttl: number;
}

export function BatchLock(batchLockEvent: BatchLockType): MethodDecorator {
  return applyDecorators(SetMetadata(BATCH_LOCK, batchLockEvent));
}
