import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LearningModule } from './learning/learning.module';
import { NodesModule } from './nodes/nodes.module';
import { EdgesModule } from './edges/edges.module';
import { PrismaModule } from './prisma/prisma.module';
import { LearnprogressModule } from './learnprogress/learnprogress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    LearningModule,
    NodesModule,
    EdgesModule,
    LearnprogressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 