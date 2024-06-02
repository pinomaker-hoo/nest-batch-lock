// ** Nest Imports
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

// ** Decorators Imports
import { BATCH_LOCK, BatchLockType } from './batch-lock.decorator';

// ** Redis Imports
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class BatchLockProvider {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  onModuleInit(): void {
    this.getInstance();
  }

  getInstance(): void {
    this.discovery
      .getProviders()
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter(({ instance }) => instance && Object.getPrototypeOf(instance))
      .forEach(({ instance }) => {
        this.scanner.scanFromPrototype(
          instance,
          Object.getPrototypeOf(instance),
          this.batchLock(instance),
        );
      });
  }

  batchLock(instance) {
    return (methodName) => {
      const methodRef = instance[methodName];

      const metadata: BatchLockType = this.reflector.get(BATCH_LOCK, methodRef);

      if (!metadata) {
        return;
      }

      const originalMethod = instance[methodName];
      const { name, ttl } = metadata;
      instance[methodName] = async (...args: unknown[]) => {
        const response = await this.validationBatch(name);

        if (!response) {
          return;
        }

        await this.setRedisBatch(name, ttl);

        const result = await originalMethod.apply(instance, args);
        await this.initRedis(name, ttl);
        return result;
      };
    };
  }

  private async validationBatch(name: string) {
    const batch = await this.redis.get(name);

    return batch === null;
  }

  private async setRedisBatch(name: string, ttl: number) {
    await this.redis.set(name, ttl);
  }

  private async initRedis(name: string, ttl: number) {
    setTimeout(async () => {
      await this.removeRedisBatch(name);
    }, ttl * 1000);
  }

  private async removeRedisBatch(name: string) {
    await this.redis.del(name);
  }
}
