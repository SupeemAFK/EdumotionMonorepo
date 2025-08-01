import { PartialType } from '@nestjs/mapped-types';
import { CreateLearnprogressDto } from './create-learnprogress.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateLearnprogressDto extends PartialType(CreateLearnprogressDto) {
  @IsString()
  @IsOptional()
  currentNode?: string;
}