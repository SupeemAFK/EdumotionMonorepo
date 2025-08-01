import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLearnprogressDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  learningId: string;

  @IsString()
  @IsNotEmpty()
  currentNode: string;
}