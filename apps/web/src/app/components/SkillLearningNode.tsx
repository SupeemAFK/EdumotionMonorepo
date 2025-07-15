"use client"

import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from "@xyflow/react";
import { motion } from "motion/react";
import { FaCheck, FaPlay, FaLock, FaClock } from "react-icons/fa";

interface SkillNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  video: string;
  status: 'completed' | 'current' | 'locked' | 'available';
  duration: string;
  videoSegments?: {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    description: string;
  }[];
}

type SkillLearningNodeProps = NodeProps<Node<SkillNodeData>>;

export default function SkillLearningNode({ data, selected }: SkillLearningNodeProps) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'current': return 'border-blue-500 bg-blue-500/10';
      case 'available': return 'border-purple-500 bg-purple-500/10';
      case 'locked': return 'border-gray-600 bg-gray-600/10';
      default: return 'border-gray-600 bg-gray-600/10';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed': return <FaCheck className="text-green-500" />;
      case 'current': return <FaPlay className="text-blue-500" />;
      case 'available': return <FaPlay className="text-purple-500" />;
      case 'locked': return <FaLock className="text-gray-500" />;
      default: return <FaPlay className="text-gray-500" />;
    }
  };

  const isInteractive = data.status !== 'locked';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        min-w-64 max-w-80 relative group rounded-lg cursor-pointer
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${getStatusColor()}
        ${isInteractive ? 'hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}
        border-2 p-4 bg-gray-800/50 backdrop-blur-sm
      `}
    >
      {/* Glow effect for selected node */}
      {selected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur opacity-30"></div>
      )}
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400"
      />
      
      {/* Node Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="text-white font-semibold text-sm">{data.label}</h3>
          </div>
          {data.status === 'current' && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-xs mb-3 line-clamp-2">{data.description}</p>
        
        {/* Duration */}
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <FaClock className="text-xs" />
          <span>{data.duration}</span>
        </div>
        
        {/* Video Segments Count */}
        {data.videoSegments && data.videoSegments.length > 0 && (
          <div className="text-xs text-gray-400">
            {data.videoSegments.length} video segments
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${data.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
            ${data.status === 'current' ? 'bg-blue-500/20 text-blue-400' : ''}
            ${data.status === 'available' ? 'bg-purple-500/20 text-purple-400' : ''}
            ${data.status === 'locked' ? 'bg-gray-500/20 text-gray-400' : ''}
          `}>
            {data.status === 'completed' ? 'Done' : 
             data.status === 'current' ? 'Active' : 
             data.status === 'available' ? 'Ready' : 'Locked'}
          </div>
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-400"
      />
    </motion.div>
  );
} 