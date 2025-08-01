import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CreateLearningDto } from './dto/create-learning.dto';
import { UpdateLearningDto } from './dto/update-learning.dto';
import { SaveLearningGraphDto } from './dto/save-learning-graph.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post()
  create(@Body() createLearningDto: CreateLearningDto) {
    return this.learningService.create(createLearningDto);
  }

  @Post('save-learning-graph')
  @UseInterceptors(AnyFilesInterceptor())
  saveLearningGraph(
    @Body('saveLearningGraphDto') saveLearningGraphDtoString: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    // Parse the JSON string to DTO
    const saveLearningGraphDto: SaveLearningGraphDto = JSON.parse(saveLearningGraphDtoString);
    return this.learningService.saveLearningGraph(saveLearningGraphDto, files);
  }

  @Get()
  findAll() {
    return this.learningService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningService.findOne(id);
  }

  @Get(':id/graph')
  getGraph(@Param('id') id: string) {
    return this.learningService.getGraph(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLearningDto: UpdateLearningDto) {
    return this.learningService.update(id, updateLearningDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningService.remove(id);
  }
}
