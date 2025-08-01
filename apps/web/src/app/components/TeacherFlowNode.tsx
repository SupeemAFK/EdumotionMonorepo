"use client"

import React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
// import { motion } from "motion/react"; // Removed to eliminate drag delays
import { FaPlay, FaStop, FaEye, FaRobot, FaRunning, FaFile, FaFilePdf, FaFileImage, FaFileVideo } from "react-icons/fa";
import { FlowNodeData, AIModelType, UploadedFile } from "./TeacherFlowBuilder";
import VideoPlayer from "./VideoPlayer";

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
    <div
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
      
      <div className="relative bg-white text-gray-800 rounded-[10px] w-full h-full overflow-hidden shadow-md">
        {/* Node Header */}
                  <div className="p-4 border-b border-gray-200">
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
                      <p className="text-gray-600 text-sm mt-1">{data.description}</p>
        </div>

        {/* AI Model Section - Only for regular nodes */}
        {hasAIModel && !isStart && !isEnd && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">AI Detection</span>
              <div className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getAIModelColor(data.aiModel)} text-white`}>
                {getAIModelLabel(data.aiModel)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Threshold: {(data.threshold * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* Video Section - Only for regular nodes */}
        {data.files && data.files.some(file => file.type.includes('video')) && !isStart && !isEnd && (
          <div className="border-b border-gray-200">
            {data.files.filter(file => file.type.includes('video')).slice(0, 1).map((videoFile) => (
                <div key={videoFile.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Video Content</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" title="Video file"></div>
                      {videoFile.segmentData && (
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          Segment
                        </span>
                      )}
                    </div>
                  </div>
                
                {/* Video Player */}
                <div className="mb-2">
                  <VideoPlayer
                    src={videoFile.url}
                    startTime={videoFile.segmentData?.startTime}
                    endTime={videoFile.segmentData?.endTime}
                    className="h-32 w-full"
                    showControls={true}
                  />
                </div>
                
                {/* Video Info */}
                <div className="text-xs text-gray-500">
                  <div className="truncate">{videoFile.name}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span>{formatFileSize(videoFile.size)}</span>
                    {videoFile.segmentData && (
                      <span className="text-purple-600">
                        {Math.floor(videoFile.segmentData.startTime / 60)}:{String(Math.floor(videoFile.segmentData.startTime % 60)).padStart(2, '0')} - {Math.floor(videoFile.segmentData.endTime / 60)}:{String(Math.floor(videoFile.segmentData.endTime % 60)).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materials Section - Only for regular nodes */}
        {data.files && data.files.some(file => !file.type.includes('video')) && !isStart && !isEnd && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Learning Materials</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has material files"></div>
                <span className="text-xs text-gray-500 ml-1">{data.files.filter(file => !file.type.includes('video')).length} file(s)</span>
              </div>
            </div>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {/* Show material files */}
              {data.files.filter(file => !file.type.includes('video')).slice(0, 3).map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div key={file.id} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <FileIcon className="w-3 h-3 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-gray-800">{file.name}</div>
                      <div className="text-gray-500">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                );
              })}
              {data.files.filter(file => !file.type.includes('video')).length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{data.files.filter(file => !file.type.includes('video')).length - 3} more files
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State for Files - Only for regular nodes */}
        {(!data.files || data.files.length === 0) && !isStart && !isEnd && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Learning Materials</span>
              <span className="text-xs text-amber-600">No files uploaded</span>
            </div>
            <div className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded p-2">
              Click to configure and upload video/materials
            </div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${hasAIModel ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          <span className="text-gray-600">
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
    </div>
  );
} 