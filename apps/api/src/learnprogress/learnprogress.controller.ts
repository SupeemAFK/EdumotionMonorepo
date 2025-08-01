import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LearnprogressService } from './learnprogress.service';
import { CreateLearnprogressDto } from './dto/create-learnprogress.dto';
import { UpdateLearnprogressDto } from './dto/update-learnprogress.dto';

@Controller('learnprogress')
export class LearnprogressController {
  constructor(private readonly learnprogressService: LearnprogressService) {}

  @Post()
  create(@Body() createLearnprogressDto: CreateLearnprogressDto) {
    return this.learnprogressService.create(createLearnprogressDto);
  }

  @Post('create-or-update')
  createOrUpdate(@Body() body: { userId: string; learningId: string; currentNode: string }) {
    return this.learnprogressService.createOrUpdateProgress(
      body.userId,
      body.learningId,
      body.currentNode
    );
  }

  @Get()
  findAll() {
    return this.learnprogressService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.learnprogressService.findByUser(userId);
  }

  @Get('user/:userId/learning/:learningId')
  findByUserAndLearning(
    @Param('userId') userId: string,
    @Param('learningId') learningId: string
  ) {
    return this.learnprogressService.findByUserAndLearning(userId, learningId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learnprogressService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLearnprogressDto: UpdateLearnprogressDto) {
    return this.learnprogressService.update(id, updateLearnprogressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learnprogressService.remove(id);
  }
}