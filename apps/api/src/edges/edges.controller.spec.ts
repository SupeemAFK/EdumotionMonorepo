import { Test, TestingModule } from '@nestjs/testing';
import { EdgesController } from './edges.controller';
import { EdgesService } from './edges.service';

describe('EdgesController', () => {
  let controller: EdgesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdgesController],
      providers: [EdgesService],
    }).compile();

    controller = module.get<EdgesController>(EdgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
