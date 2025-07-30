import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateLearningDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @IsString()
    level: string;

    @IsNumber()
    rating: number;

    @IsNumber()
    estimatedTime: number;

    @IsString()
    creatorId: string;
}