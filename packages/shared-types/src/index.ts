// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Skill/Learning types
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
  teacherId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Flow types for the visual editor
export interface FlowNode {
  id: string;
  type: 'skill' | 'assessment' | 'resource';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    skillId?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
} 