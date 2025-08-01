import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NodeDto {
    @IsString()
    id: string; // Temporary ID for referencing in edges
    
    @IsString()
    title: string;
    
    @IsString()
    description: string;
    
    @IsNumber()
    positionX: number;
    
    @IsNumber()
    positionY: number;
    
    @IsOptional()
    @IsString()
    algorithm?: string; // Not required for Start/End nodes
    
    @IsString()
    type: string; // 'start', 'end', or 'step'
    
    @IsOptional()
    @IsNumber()
    threshold?: number; // Not required for Start/End nodes
    
    // File field names that will be used in the multipart form
    @IsOptional()
    @IsString()
    videoFieldName?: string; // Not used for Start/End nodes
    
    @IsOptional()
    @IsString()
    materialsFieldName?: string; // Not used for Start/End nodes
    
    // Video segment data for nodes created from video editor
    @IsOptional()
    @IsNumber()
    videoStartTime?: number; // Start time in seconds for video segments
    
    @IsOptional()
    @IsNumber()
    videoEndTime?: number; // End time in seconds for video segments
    
    @IsOptional()
    @IsString()
    originalFileName?: string; // Original video file name for segments
}

export class EdgeDto {
    @IsString()
    fromNode: string; // References NodeDto.id
    
    @IsString()
    toNode: string; // References NodeDto.id
}

export class SaveLearningGraphDto {
    @IsString()
    learningId: string; // ID of existing learning record
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NodeDto)
    nodes: NodeDto[];
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EdgeDto)
    edges: EdgeDto[];
}