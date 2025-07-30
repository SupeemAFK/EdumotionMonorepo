import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateNodeDto } from './dto/createNodeDto';
import { UpdateNodeDto } from './dto/updateNodeDto';

@Injectable()
export class NodesService {
    constructor(private readonly prismaService: PrismaService) {}

    create(createNodeDto: CreateNodeDto) {
        return this.prismaService.node.create({
            data: {
            ...createNodeDto,
            createdAt: new Date(),
            updatedAt: new Date(),
            },
        });
    }

    findAll() {
        return this.prismaService.node.findMany()
    }

    findOne(id: string) {
        return this.prismaService.node.findUnique({ where: { id } })
    }

    update(id: string, updateNodeDto: UpdateNodeDto) {
        return this.prismaService.node.update({
            where: { id },
            data: {
            ...updateNodeDto,
            updatedAt: new Date(),
            },
        });
    }

    remove(id: string) {
        return this.prismaService.node.delete({ where: { id } });
    }
}
