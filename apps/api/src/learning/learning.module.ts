import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { NodesModule } from '@/nodes/nodes.module';

@Module({
  controllers: [LearningController],
  providers: [LearningService],
  imports: [NodesModule],
})
export class LearningModule {}
