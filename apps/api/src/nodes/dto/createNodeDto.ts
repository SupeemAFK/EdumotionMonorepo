import { IsString, IsNumber } from 'class-validator';

export class CreateNodeDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    positionX: number;  

    @IsString()
    positionY: number;

    @IsString()
    learningId: string;

    @IsString()
    algorithm: string;

    @IsString()
    type: string;

    @IsString()
    threshold: number;
}