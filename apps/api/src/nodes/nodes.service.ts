import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateNodeDto } from './dto/createNodeDto';
import { UpdateNodeDto } from './dto/updateNodeDto';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class NodesService {
    constructor(private readonly prismaService: PrismaService) {}

    client = new S3Client({
        region: process.env.S3_REGION,
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
    });

    async uploadNodeFile(files: { video?: Express.Multer.File[], materials?: Express.Multer.File[] }, nodeId: string) {
        let videoUrl: string | null = null
        let materialsUrl: string | null = null

        if (files.video) {
            const videoKey = await this.uploadToS3(files.video[0], 'file', nodeId);
            videoUrl = await this.getUrl(videoKey);
        }

        if (files.materials) {
            const materialsKey = await this.uploadToS3(files.materials[0], 'file', nodeId);
            materialsUrl = await this.getUrl(materialsKey);
        }

        return {
            videoUrl,
            materialsUrl,
        }
    }
    
    uploadToS3 = async (
        file: Express.Multer.File,
        fileType: string,
        nodeId: string,
      ) => {
        const key = this.generateFilename(file.originalname, nodeId, fileType);
    
        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
    
        try {
          const command = new PutObjectCommand(params);
          await this.client.send(command);
          return key;
        } catch (error) {
          console.error('Error uploading to S3:', error);
          throw error;
        }
    };

    private generateFilename(filename: string, nodeId: string, fileType: string) {
        const index = filename.lastIndexOf('.');
        const extension = index !== -1 ? filename.slice(index) : '';
        return `${fileType}_${nodeId}${extension}`;
    }

    async getUrl(filename: string) {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: filename,
        });
    
        const signedUrl = await getSignedUrl(this.client, command, {
          expiresIn: 3600,
        });
        return signedUrl;
    }
    
    async create(createNodeDto: CreateNodeDto, files: { video?: Express.Multer.File[], materials?: Express.Multer.File[] }) {
        const nodeId = uuidv4()
        const fileUrls = await this.uploadNodeFile(files, nodeId)
        return this.prismaService.node.create({
            data: {
            ...createNodeDto,
            id: nodeId,
            createdAt: new Date(),
            updatedAt: new Date(),
            video: fileUrls.videoUrl,
            materials: fileUrls.materialsUrl,
            positionX: Number(createNodeDto.positionX),
            positionY: Number(createNodeDto.positionY),
            threshold: Number(createNodeDto.threshold),
            },
        });
    }

    findAll() {
        return this.prismaService.node.findMany()
    }

    findOne(id: string) {
        return this.prismaService.node.findUnique({ where: { id } })
    }

    async update(id: string, updateNodeDto: UpdateNodeDto, files: { video?: Express.Multer.File[], materials?: Express.Multer.File[] }) {
        const fileUrls = await this.uploadNodeFile(files, id)
        return this.prismaService.node.update({
            where: { id },
            data: {
            ...updateNodeDto,
            updatedAt: new Date(),
            video: fileUrls.videoUrl,
            materials: fileUrls.materialsUrl,
            positionX: Number(updateNodeDto.positionX),
            positionY: Number(updateNodeDto.positionY),
            threshold: Number(updateNodeDto.threshold),
            },
        });
    }

    remove(id: string) {
        return this.prismaService.node.delete({ where: { id } });
    }
}
