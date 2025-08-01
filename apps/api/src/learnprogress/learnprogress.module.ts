import { Module } from '@nestjs/common';
import { LearnprogressService } from './learnprogress.service';
import { LearnprogressController } from './learnprogress.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LearnprogressController],
  providers: [LearnprogressService],
  exports: [LearnprogressService],
})
export class LearnprogressModule {}