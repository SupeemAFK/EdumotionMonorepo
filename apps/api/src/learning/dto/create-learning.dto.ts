export class CreateLearningDto {
    id: string;
    title: string;
    description: string;
    tags: string[];
    level: string;
    rating: number;
    estimatedTime: number;
    creatorId: string;
}
