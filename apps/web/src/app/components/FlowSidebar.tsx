"use client"

import React, { useState, useEffect, useRef } from "react";
import { IoClose, IoEye, IoSettings, IoInformationCircle, IoCloudUpload, IoTrash } from "react-icons/io5";
import { FaRobot, FaRunning, FaFile, FaFilePdf, FaFileImage, FaFileVideo } from "react-icons/fa";
import { Node } from "@xyflow/react";
import { FlowNodeData, AIModelType, UploadedFile } from "./TeacherFlowBuilder";

interface FlowSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node<FlowNodeData> | undefined;
  onUpdateNode: (nodeId: string, data: Partial<FlowNodeData>) => void;
}

const aiModels = [
  {
    id: 'vision-language' as AIModelType,
    name: 'Vision Language Model',
    description: 'Analyzes images and understands visual content with natural language processing',
    icon: IoEye,
    color: 'from-blue-500 to-purple-500',
    features: ['Image understanding', 'Text recognition', 'Scene analysis', 'Object identification']
  },
  {
    id: 'object-detection' as AIModelType,
    name: 'Object Detection',
    description: 'Detects and classifies objects in real-time video streams',
    icon: FaRobot,
    color: 'from-green-500 to-teal-500',
    features: ['Real-time detection', 'Multiple objects', 'Bounding boxes', 'Classification']
  },
  {
    id: 'motion-matching' as AIModelType,
    name: 'Motion Matching',
    description: 'Tracks and analyzes human movement patterns and gestures',
    icon: FaRunning,
    color: 'from-orange-500 to-red-500',
    features: ['Pose estimation', 'Gesture recognition', 'Movement tracking', 'Activity analysis']
  }
];

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

export default function FlowSidebar({ isOpen, onClose, selectedNode, onUpdateNode }: FlowSidebarProps) {
  const [localData, setLocalData] = useState<FlowNodeData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedNode) {
      setLocalData(selectedNode.data);
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (selectedNode && localData) {
      onUpdateNode(selectedNode.id, localData);
      onClose();
    }
  };

  const handleAIModelSelect = (modelId: AIModelType) => {
    if (localData) {
      setLocalData({ ...localData, aiModel: modelId });
    }
  };

  const handleThresholdChange = (threshold: number) => {
    if (localData) {
      setLocalData({ ...localData, threshold });
    }
  };

  const handleLabelChange = (label: string) => {
    if (localData) {
      setLocalData({ ...localData, label });
    }
  };

  const handleDescriptionChange = (description: string) => {
    if (localData) {
      setLocalData({ ...localData, description });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !localData) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // In a real app, this would be uploaded to a server
      uploadedAt: new Date(),
    }));

    setLocalData({
      ...localData,
      files: [...localData.files, ...newFiles],
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileDelete = (fileId: string) => {
    if (localData) {
      const updatedFiles = localData.files.filter((file) => file.id !== fileId);
      setLocalData({ ...localData, files: updatedFiles });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (!files || !localData) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    }));

    setLocalData({
      ...localData,
      files: [...localData.files, ...newFiles],
    });
  };

  if (!isOpen || !selectedNode || !localData) {
    return null;
  }

  const selectedModel = aiModels.find(model => model.id === localData.aiModel);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Node Configuration</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <IoClose className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <IoInformationCircle className="w-5 h-5" />
            Basic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Node Label
            </label>
            <input
              type="text"
              value={localData.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter node label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={localData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter node description"
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <IoCloudUpload className="w-5 h-5" />
            Learning Materials
          </h3>
          
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              dragOver 
                ? 'border-blue-400 bg-blue-400/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileUpload}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi"
              onChange={handleFileUpload}
              className="hidden"
            />
            <IoCloudUpload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-400 mb-2">
              {dragOver ? 'Drop files here' : 'Drag and drop files here, or click to select'}
            </p>
            <button
              onClick={triggerFileUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Choose Files
            </button>
          </div>

          {/* Uploaded Files List */}
          {localData.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">
                Uploaded Files ({localData.files.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {localData.files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                      <FileIcon className="w-5 h-5 text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{file.name}</div>
                        <div className="text-xs text-gray-400">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <IoTrash className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Model Selection */}
        {!localData.isStartNode && !localData.isEndNode && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <IoSettings className="w-5 h-5" />
              AI Detection Model
            </h3>
            
            <div className="space-y-3">
              {aiModels.map((model) => {
                const Icon = model.icon;
                const isSelected = localData.aiModel === model.id;
                
                return (
                  <div
                    key={model.id}
                    onClick={() => handleAIModelSelect(model.id)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${model.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{model.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{model.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Threshold Setting */}
            {localData.aiModel && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Detection Threshold: {(localData.threshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localData.threshold}
                  onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Model Details */}
            {selectedModel && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-medium text-white mb-2">Selected Model Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Model:</span>
                    <span className="text-white">{selectedModel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Threshold:</span>
                    <span className="text-white">{(localData.threshold * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">Ready</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 