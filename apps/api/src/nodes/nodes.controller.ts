import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/createNodeDto';
import { UpdateNodeDto } from './dto/updateNodeDto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'materials', maxCount: 1 },
  ]))
  create(
    @Body() createNodeDto: CreateNodeDto,
    @UploadedFiles() files: { video?: Express.Multer.File[], materials?: Express.Multer.File[] }
  ) {
    return this.nodesService.create(createNodeDto, files);
  }

  @Get()
  findAll() {
    return this.nodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'materials', maxCount: 1 },
  ]))
  update(
    @Param('id') id: string, 
    @Body() updateNodeDto: UpdateNodeDto,
    @UploadedFiles() files: { video?: Express.Multer.File[], materials?: Express.Multer.File[] }
  ) {
    return this.nodesService.update(id, updateNodeDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodesService.remove(id);
  }
}
