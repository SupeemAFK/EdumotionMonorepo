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
    await this.validateFilesForNodes(saveLearningGraphDto.nodes, files, saveLearningGraphDto.learningId);

    // 1. First, upload all files outside the transaction (this is the slow part)
    const nodeFileUrls = new Map<string, { videoUrl?: string, materialsUrl?: string }>();
    const uploadedFilesList: string[] = []; // Track uploaded files for cleanup on error
    
    try {
      for (const nodeDto of saveLearningGraphDto.nodes) {
        if (nodeDto.type === 'start' || nodeDto.type === 'end') {
          continue; // Skip file uploads for system nodes
        }

        const nodeFiles = this.extractFilesForNode(nodeDto, files);
        
        if (nodeFiles.video || nodeFiles.materials) {
          console.log(`Uploading files for node ${nodeDto.id}...`);
          const fileUrls = await this.nodesService.uploadNodeFile(nodeFiles, nodeDto.id);
          nodeFileUrls.set(nodeDto.id, fileUrls);
          
          // Track uploaded files for potential cleanup
          if (fileUrls.videoUrl) uploadedFilesList.push(fileUrls.videoUrl);
          if (fileUrls.materialsUrl) uploadedFilesList.push(fileUrls.materialsUrl);
          
          console.log(`Files uploaded for node ${nodeDto.id}:`, fileUrls);
        }
      }
    } catch (uploadError) {
      console.error('File upload failed:', uploadError);
      // TODO: Add cleanup logic here if needed (delete uploaded files)
      throw uploadError;
    }

    // 2. Now use a fast transaction for database operations only
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // 1. Verify the learning record exists
      const learning = await prisma.learning.findUnique({
        where: { id: saveLearningGraphDto.learningId },
      });

      if (!learning) {
        throw new NotFoundException(`Learning with ID ${saveLearningGraphDto.learningId} not found`);
      }

      // 2. Get existing nodes to preserve file URLs when no new files are uploaded
      const existingNodes = await prisma.node.findMany({
        where: { learningId: saveLearningGraphDto.learningId },
        select: { id: true, video: true, materials: true }
      });

      // 3. Delete all existing edges (will be recreated)
      await prisma.edge.deleteMany({
        where: { learningId: saveLearningGraphDto.learningId }
      });

      // 4. Create a mapping from node IDs to actual database IDs
      const nodeIdMapping = new Map<string, string>();
      const createdNodes = [];

      // 5. Process each node: create/update node records using pre-uploaded files
      for (const nodeDto of saveLearningGraphDto.nodes) {
        // Use the node ID from the frontend (it's already a valid UUID)
        const actualNodeId = nodeDto.id;
        nodeIdMapping.set(nodeDto.id, actualNodeId);

        // Get existing node data
        const existingNode = existingNodes.find(n => n.id === actualNodeId);

        // Get pre-uploaded file URLs
        const uploadedFileUrls = nodeFileUrls.get(actualNodeId) || { videoUrl: null, materialsUrl: null };

        // Determine final file URLs (use new uploads if available, otherwise keep existing)
        let finalVideoUrl = (nodeDto.type === 'start' || nodeDto.type === 'end') ? null :
          (uploadedFileUrls.videoUrl || existingNode?.video || null);
        
        // If this is a video segment, store the segment data with the video URL
        if (finalVideoUrl && (nodeDto.videoStartTime !== undefined || nodeDto.videoEndTime !== undefined)) {
          const videoData = {
            url: finalVideoUrl,
            startTime: nodeDto.videoStartTime,
            endTime: nodeDto.videoEndTime,
            isSegment: true,
            // Additional metadata for segments
            originalFileName: nodeDto.originalFileName || 'video.mp4',
            segmentTitle: nodeDto.title || 'Video Segment'
          };
          finalVideoUrl = JSON.stringify(videoData);
        }
        
        const finalMaterialsUrl = (nodeDto.type === 'start' || nodeDto.type === 'end') ? null :
          (uploadedFileUrls.materialsUrl || existingNode?.materials || null);

        // Create or update the node record
        const createdNode = await prisma.node.upsert({
          where: { id: actualNodeId },
          update: {
            title: nodeDto.title,
            description: nodeDto.description,
            video: finalVideoUrl,
            materials: finalMaterialsUrl,
            positionX: nodeDto.positionX,
            positionY: nodeDto.positionY,
            algorithm: (nodeDto.type === 'start' || nodeDto.type === 'end') ? null : nodeDto.algorithm,
            type: nodeDto.type,
            threshold: (nodeDto.type === 'start' || nodeDto.type === 'end') ? null : nodeDto.threshold,
            updatedAt: new Date(),
          },
          create: {
            id: actualNodeId,
            title: nodeDto.title,
            description: nodeDto.description,
            video: finalVideoUrl,
            materials: finalMaterialsUrl,
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

      // 6. Delete nodes that are no longer in the graph
      const currentNodeIds = saveLearningGraphDto.nodes.map(n => n.id);
      await prisma.node.deleteMany({
        where: {
          learningId: saveLearningGraphDto.learningId,
          id: { notIn: currentNodeIds }
        }
      });

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
    }, {
      timeout: 120000, // 30 seconds timeout for database operations
    });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      // TODO: Add cleanup logic here if needed (delete uploaded files)
      throw transactionError;
    }
  }

  private async validateFilesForNodes(nodes: NodeDto[], files: Express.Multer.File[], learningId: string) {
    const fileFieldNames = files.map(file => file.fieldname);
    
    // Get existing nodes from database to check which ones already have files
    const existingNodes = await this.prismaService.node.findMany({
      where: { learningId },
      select: { id: true, video: true, materials: true }
    });
    
    for (const node of nodes) {
      // Skip validation for Start and End nodes
      if (node.type === 'start' || node.type === 'end') {
        continue;
      }

      const existingNode = existingNodes.find(existing => existing.id === node.id);
      
      // For step nodes, check if they have video (either uploaded now or already exist)
      const hasVideoFile = node.videoFieldName && fileFieldNames.includes(node.videoFieldName);
      const hasExistingVideo = existingNode && existingNode.video;
      
      if (!hasVideoFile && !hasExistingVideo) {
        throw new BadRequestException(`Node ${node.id} requires a video file. Please upload a video for this step.`);
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
    return this.prismaService.learning.findMany({ include: { creator: true } });
  }

  findAllByUser(userId: string) {
    return this.prismaService.learning.findMany({ where: { creatorId: userId } });
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

    // Generate fresh signed URLs for all video and material files
    const nodesWithFreshUrls = await Promise.all(
      learning.nodes.map(async (node) => {
        let freshVideoUrl = node.video;
        let freshMaterialsUrl = node.materials;

        // Handle video URLs - check if it's a segment or regular video
        if (node.video) {
          try {
            // Try to parse as video segment data
            const videoData = JSON.parse(node.video);
            if (videoData.url && this.nodesService.isS3Key(videoData.url)) {
              // Generate fresh signed URL for the segment
              videoData.url = await this.nodesService.getFreshSignedUrl(videoData.url);
              freshVideoUrl = JSON.stringify(videoData);
            }
          } catch {
            // Not JSON, treat as regular S3 key
            if (this.nodesService.isS3Key(node.video)) {
              freshVideoUrl = await this.nodesService.getFreshSignedUrl(node.video);
            }
          }
        }

        // Handle materials URLs
        if (node.materials && this.nodesService.isS3Key(node.materials)) {
          freshMaterialsUrl = await this.nodesService.getFreshSignedUrl(node.materials);
        }

        return {
          ...node,
          video: freshVideoUrl,
          materials: freshMaterialsUrl,
        };
      })
    );

    return {
      learning: {
        ...learning,
        nodes: nodesWithFreshUrls,
      },
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

  async remove(id: string) {
    return await this.prismaService.$transaction(async (prisma) => {
      // 1. Delete all edges associated with this learning
      await prisma.edge.deleteMany({
        where: { learningId: id }
      });

      // 2. Delete all nodes associated with this learning
      // (This will also clean up any file references)
      await prisma.node.deleteMany({
        where: { learningId: id }
      });

      // 3. Delete the learning record itself
      const deletedLearning = await prisma.learning.delete({
        where: { id }
      });

      return {
        message: 'Learning course and all associated data deleted successfully',
        deletedLearning
      };
    });
  }
}
