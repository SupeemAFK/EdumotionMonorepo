import { Module } from '@nestjs/common';
import { EdgesService } from './edges.service';
import { EdgesController } from './edges.controller';

@Module({
  controllers: [EdgesController],
  providers: [EdgesService],
})
export class EdgesModule {}
