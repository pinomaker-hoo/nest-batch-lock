// ** Nest Imports
import { NestFactory } from '@nestjs/core';

// ** Custom Module Imports
import { AppModule } from './app.module';

// ** Express Imports
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // ** Server Container 생성
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    snapshot: true,
  });

  await app.listen(8080);
}
bootstrap();
