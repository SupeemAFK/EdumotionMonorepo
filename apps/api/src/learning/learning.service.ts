import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateLearningDto } from './dto/create-learning.dto';
import { UpdateLearningDto } from './dto/update-learning.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { SaveLearningGraphDto, NodeDto } from './dto/save-learning-graph.dto';
import { NodesService } from '@/nodes/nodes.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LearningService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodesService: NodesService
  ) {}

  async saveLearningGraph(saveLearningGraphDto: SaveLearningGraphDto, files: Express.Multer.File[]) {
    console.log('Received saveLearningGraphDto:', JSON.stringify(saveLearningGraphDto, null, 2));
    console.log('Received files:', files.map(f => ({ fieldname: f.fieldname, filename: f.originalname, size: f.size })));
    
    // Validate that we have all required files
    this.validateFilesForNodes(saveLearningGraphDto.nodes, files);

    // Use a transaction to ensure all operations succeed or fail together
    return await this.prismaService.$transaction(async (prisma) => {
      // 1. Verify the learning record exists
      const learning = await prisma.learning.findUnique({
        where: { id: saveLearningGraphDto.learningId },
      });

      if (!learning) {
        throw new NotFoundException(`Learning with ID ${saveLearningGraphDto.learningId} not found`);
      }

      // 2. Create a mapping from temporary node IDs to actual database IDs
      const nodeIdMapping = new Map<string, string>();
      const createdNodes = [];

      // 3. Process each node: upload files and create node records
      for (const nodeDto of saveLearningGraphDto.nodes) {
        const actualNodeId = uuidv4();
        nodeIdMapping.set(nodeDto.id, actualNodeId);

        // Extract files for this node
        const nodeFiles = this.extractFilesForNode(nodeDto, files);

        // Upload files and get URLs
        const fileUrls = await this.nodesService.uploadNodeFile(nodeFiles, actualNodeId);

        // Create the node record
        const createdNode = await prisma.node.create({
          data: {
            id: actualNodeId,
            title: nodeDto.title,
            description: nodeDto.description,
            video: (nodeDto.type === 'start' || nodeDto.type === 'end') ? null : (fileUrls.videoUrl || null),
            materials: (nodeDto.type === 'start' || nodeDto.type === 'end') ? null : fileUrls.materialsUrl,
            positionX: nodeDto.positionX,
            positionY: nodeDto.positionY,
            learningId: saveLearningGraphDto.learningId,
            algorithm: (nodeDto.type === 'start' || nodeDto.type === 'end') ? null : nodeDto.algorithm,
            type: nodeDto.type,
            threshold: (nodeDto.type === 'start' || nodeDto.type === 'end') ? null : nodeDto.threshold,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        createdNodes.push(createdNode);
      }

      // 4. Create edges using the actual node IDs
      const createdEdges = [];
      for (const edgeDto of saveLearningGraphDto.edges) {
        const fromNodeId = nodeIdMapping.get(edgeDto.fromNode);
        const toNodeId = nodeIdMapping.get(edgeDto.toNode);

        if (!fromNodeId || !toNodeId) {
          throw new BadRequestException(
            `Invalid node reference in edge: ${edgeDto.fromNode} -> ${edgeDto.toNode}`
          );
        }

        const createdEdge = await prisma.edge.create({
          data: {
            learningId: saveLearningGraphDto.learningId,
            fromNode: fromNodeId,
            toNode: toNodeId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        createdEdges.push(createdEdge);
      }

      // 5. Update the learning's updatedAt timestamp
      await prisma.learning.update({
        where: { id: saveLearningGraphDto.learningId },
        data: { updatedAt: new Date() },
      });

      // 6. Return the complete graph data
      return {
        learning,
        nodes: createdNodes,
        edges: createdEdges,
      };
    });
  }

  private validateFilesForNodes(nodes: NodeDto[], files: Express.Multer.File[]) {
    const fileFieldNames = files.map(file => file.fieldname);
    
    for (const node of nodes) {
      // Skip validation for Start and End nodes
      if (node.type === 'start' || node.type === 'end') {
        continue;
      }

      // Check if video file is provided (video is required for step nodes)
      if (node.videoFieldName && !fileFieldNames.includes(node.videoFieldName)) {
        throw new BadRequestException(`Missing video file for node ${node.id}: expected field ${node.videoFieldName}`);
      }
      
      // Materials are optional, so we don't validate them as strictly
      if (node.materialsFieldName && !fileFieldNames.includes(node.materialsFieldName)) {
        // Could log a warning here, but materials are optional
        console.warn(`Materials file not found for node ${node.id}: expected field ${node.materialsFieldName}`);
      }
    }
  }

  private extractFilesForNode(nodeDto: NodeDto, allFiles: Express.Multer.File[]): { video?: Express.Multer.File[], materials?: Express.Multer.File[] } {
    const nodeFiles: { video?: Express.Multer.File[], materials?: Express.Multer.File[] } = {};

    if (nodeDto.videoFieldName) {
      const videoFiles = allFiles.filter(file => file.fieldname === nodeDto.videoFieldName);
      if (videoFiles.length > 0) {
        nodeFiles.video = videoFiles;
      }
    }

    if (nodeDto.materialsFieldName) {
      const materialFiles = allFiles.filter(file => file.fieldname === nodeDto.materialsFieldName);
      if (materialFiles.length > 0) {
        nodeFiles.materials = materialFiles;
      }
    }

    return nodeFiles;
  }

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

  async getGraph(id: string) {
    const learning = await this.prismaService.learning.findUnique({ 
      where: { id }, 
      include: { 
        nodes: {
          orderBy: { createdAt: 'asc' }
        }, 
        edges: {
          orderBy: { createdAt: 'asc' }
        } 
      } 
    });

    if (!learning) {
      throw new NotFoundException(`Learning with ID ${id} not found`);
    }

    return {
      learning,
      hasGraph: learning.nodes.length > 0,
      nodeCount: learning.nodes.length,
      edgeCount: learning.edges.length
    };
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
