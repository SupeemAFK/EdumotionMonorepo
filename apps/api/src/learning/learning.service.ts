import { Injectable } from '@nestjs/common';
import { CreateLearningDto } from './dto/create-learning.dto';
import { UpdateLearningDto } from './dto/update-learning.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LearningService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createLearningDto: CreateLearningDto) {
    return this.prismaService.learning.create({
      data: {
        ...createLearningDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findAll() {
    return this.prismaService.learning.findMany();
  }

  findOne(id: string) {
    return this.prismaService.learning.findUnique({ where: { id }, include: { nodes: true, edges: true } });
  }

  update(id: string, updateLearningDto: UpdateLearningDto) {
    return this.prismaService.learning.update({
      where: { id },
      data: {
        ...updateLearningDto,
        updatedAt: new Date(),
      },
    });
  }

  remove(id: string) {
    return this.prismaService.learning.delete({ where: { id }, include: { nodes: true, edges: true } });
  }
}
