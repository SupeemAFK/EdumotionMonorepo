import { IsString, IsNumber } from 'class-validator';

export class UpdateNodeDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    positionX: number;  

    @IsString()
    positionY: number;

    @IsString()
    algorithm: string;

    @IsString()
    type: string;

    @IsString()
    threshold: number;
}