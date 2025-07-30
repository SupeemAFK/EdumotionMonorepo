import { Injectable } from '@nestjs/common';
import { CreateEdgeDto } from './dto/createEdgeDto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EdgesService {
    constructor(private readonly prismaService: PrismaService) {}

    create(createEdgeDto: CreateEdgeDto) {
        return this.prismaService.edge.create({
            data: {
            ...createEdgeDto,
            createdAt: new Date(),
            updatedAt: new Date(),
            },
        });
    }

    findAll() {
        return this.prismaService.edge.findMany()
    }

    findOne(id: string) {
        return this.prismaService.edge.findUnique({ where: { id } })
    }

    remove(id: string) {
        return this.prismaService.edge.delete({ where: { id } });
    }
}
