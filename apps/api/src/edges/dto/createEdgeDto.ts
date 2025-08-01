import { IsString } from 'class-validator';

export class CreateEdgeDto {
    @IsString()
    fromNode: string;
    
    @IsString()
    toNode: string;

    @IsString()
    learningId: string;
}