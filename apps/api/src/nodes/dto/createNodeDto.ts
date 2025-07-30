import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateNodeDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    video: string;

    @IsString()
    materials: string;

    @IsNumber()
    positionX: number;  

    @IsNumber()
    positionY: number;

    @IsString()
    learningId: string;

    @IsString()
    algorithm: string;

    @IsString()
    type: string;

    @IsNumber()
    threshold: number;
}