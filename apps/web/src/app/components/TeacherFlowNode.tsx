"use client"

import React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { motion } from "motion/react";
import { FaPlay, FaStop, FaEye, FaRobot, FaRunning, FaFile, FaFilePdf, FaFileImage, FaFileVideo } from "react-icons/fa";
import { FlowNodeData, AIModelType, UploadedFile } from "./TeacherFlowBuilder";

const getAIModelIcon = (model: AIModelType | null) => {
  switch (model) {
    case 'vision-language':
      return <FaEye className="w-4 h-4" />;
    case 'object-detection':
      return <FaRobot className="w-4 h-4" />;
    case 'motion-matching':
      return <FaRunning className="w-4 h-4" />;
    default:
      return null;
  }
};

const getAIModelLabel = (model: AIModelType | null) => {
  switch (model) {
    case 'vision-language':
      return 'Vision Language Model';
    case 'object-detection':
      return 'Object Detection';
    case 'motion-matching':
      return 'Motion Matching';
    default:
      return 'No AI Model';
  }
};

const getAIModelColor = (model: AIModelType | null) => {
  switch (model) {
    case 'vision-language':
      return 'from-blue-500 to-purple-500';
    case 'object-detection':
      return 'from-green-500 to-teal-500';
    case 'motion-matching':
      return 'from-orange-500 to-red-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return FaFilePdf;
  if (fileType.includes('image')) return FaFileImage;
  if (fileType.includes('video')) return FaFileVideo;
  return FaFile;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function TeacherFlowNode({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  const isStart = data.isStartNode;
  const isEnd = data.isEndNode;
  const hasAIModel = data.aiModel !== null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        min-w-64 max-w-80 relative group rounded-xl cursor-pointer
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${hasAIModel ? `p-0.5 bg-gradient-to-r ${getAIModelColor(data.aiModel)}` : 'border-2 border-gray-600'}
        ${isStart ? 'border-green-500' : ''}
        ${isEnd ? 'border-red-500' : ''}
      `}
    >
      {/* Glow effect for selected node */}
      {selected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-30"></div>
      )}
      
      <div className="relative bg-gray-800 text-white rounded-[10px] w-full h-full overflow-hidden">
        {/* Node Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isStart && <FaPlay className="w-4 h-4 text-green-400" />}
              {isEnd && <FaStop className="w-4 h-4 text-red-400" />}
              <h3 className="font-semibold text-lg">{data.label}</h3>
            </div>
            {hasAIModel && (
              <div className="flex items-center gap-1 text-sm">
                {getAIModelIcon(data.aiModel)}
              </div>
            )}
          </div>
          <p className="text-gray-300 text-sm mt-1">{data.description}</p>
        </div>

        {/* AI Model Section */}
        {hasAIModel && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">AI Detection</span>
              <div className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getAIModelColor(data.aiModel)} text-white`}>
                {getAIModelLabel(data.aiModel)}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Threshold: {(data.threshold * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* Files Section */}
        {data.files && data.files.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Learning Materials</span>
              <span className="text-xs text-gray-400">{data.files.length} file(s)</span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.files.slice(0, 3).map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-xs">
                    <FileIcon className="w-3 h-3 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-white">{file.name}</div>
                      <div className="text-gray-400">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                );
              })}
              {data.files.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{data.files.length - 3} more files
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${hasAIModel ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-gray-300">
              {hasAIModel ? 'Configured' : 'Needs Configuration'}
            </span>
          </div>
        </div>
      </div>

      {/* Handles */}
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-gray-500 !border-2 !border-gray-300 !w-3 !h-3"
        />
      )}
      {!isEnd && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-gray-500 !border-2 !border-gray-300 !w-3 !h-3"
        />
      )}
    </motion.div>
  );
} 