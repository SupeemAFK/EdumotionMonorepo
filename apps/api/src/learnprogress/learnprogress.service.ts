import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateLearnprogressDto } from './dto/create-learnprogress.dto';
import { UpdateLearnprogressDto } from './dto/update-learnprogress.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LearnprogressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createLearnprogressDto: CreateLearnprogressDto) {
    // Check if learning progress already exists for this user and learning
    const existingProgress = await this.prismaService.learnprogress.findFirst({
      where: {
        userId: createLearnprogressDto.userId,
        learningId: createLearnprogressDto.learningId,
      },
    });

    if (existingProgress) {
      // Update existing progress instead of creating new one
      return this.update(existingProgress.id, {
        currentNode: createLearnprogressDto.currentNode,
      });
    }

    // Verify that the learning exists
    const learning = await this.prismaService.learning.findUnique({
      where: { id: createLearnprogressDto.learningId },
    });

    if (!learning) {
      throw new NotFoundException(`Learning with ID ${createLearnprogressDto.learningId} not found`);
    }

    // Verify that the user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: createLearnprogressDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createLearnprogressDto.userId} not found`);
    }

    return this.prismaService.learnprogress.create({
      data: {
        ...createLearnprogressDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: true,
        learning: {
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prismaService.learnprogress.findMany({
      include: {
        user: true,
        learning: true,
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.learnprogress.findUnique({
      where: { id },
      include: {
        user: true,
        learning: {
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });
  }

  async findByUserAndLearning(userId: string, learningId: string) {
    return this.prismaService.learnprogress.findFirst({
      where: {
        userId,
        learningId,
      },
      include: {
        user: true,
        learning: {
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prismaService.learnprogress.findMany({
      where: { userId },
      include: {
        user: true,
        learning: true,
      },
    });
  }

  async update(id: string, updateLearnprogressDto: UpdateLearnprogressDto) {
    const existingProgress = await this.prismaService.learnprogress.findUnique({
      where: { id },
    });

    if (!existingProgress) {
      throw new NotFoundException(`Learn progress with ID ${id} not found`);
    }

    return this.prismaService.learnprogress.update({
      where: { id },
      data: {
        ...updateLearnprogressDto,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        learning: {
          include: {
            nodes: true,
            edges: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const existingProgress = await this.prismaService.learnprogress.findUnique({
      where: { id },
    });

    if (!existingProgress) {
      throw new NotFoundException(`Learn progress with ID ${id} not found`);
    }

    return this.prismaService.learnprogress.delete({
      where: { id },
    });
  }

  async createOrUpdateProgress(userId: string, learningId: string, currentNode: string) {
    // First check if progress already exists
    const existingProgress = await this.findByUserAndLearning(userId, learningId);
    
    if (existingProgress) {
      // Update existing progress
      return this.update(existingProgress.id, { currentNode });
    } else {
      // Create new progress
      return this.create({ userId, learningId, currentNode });
    }
  }
}