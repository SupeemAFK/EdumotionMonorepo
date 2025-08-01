"use client"

import React, { useState, useRef } from "react";
import { IoClose, IoCloudUpload, IoPlay } from "react-icons/io5";
import { FaFileVideo } from "react-icons/fa";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (videoFile: File, title: string, description: string) => void;
  position: { x: number; y: number };
}

export default function VideoUploadModal({ 
  isOpen, 
  onClose, 
  onVideoUploaded, 
  position 
}: VideoUploadModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (file: File) => {
    if (!file.type.includes('video')) {
      alert('Please select a video file');
      return;
    }

    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    
    // Auto-generate title from filename
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    setTitle(nameWithoutExtension);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVideoSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleVideoSelect(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedVideo || !title.trim()) {
      alert('Please select a video and enter a title');
      return;
    }

    onVideoUploaded(selectedVideo, title.trim(), description.trim());
    handleClose();
  };

  const handleClose = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
    setTitle("");
    setDescription("");
    setDragOver(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Upload Video for New Node</h2>
              <p className="text-sm text-gray-600">
                Position: ({Math.round(position.x)}, {Math.round(position.y)})
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Upload Area */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Video Content</h3>
            
            {!selectedVideo ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <IoCloudUpload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-blue-400' : 'text-gray-500'}`} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {dragOver ? 'Drop video here' : 'Upload Video Segment'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop a video file or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: MP4, MOV, AVI, MKV, WebM
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaFileVideo className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{selectedVideo.name}</h4>
                      <p className="text-sm text-gray-500">
                        {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVideo(null);
                        setVideoPreview(null);
                        setTitle("");
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <IoClose className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  {videoPreview && (
                    <div className="mt-4">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full max-h-48 rounded-lg"
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Node Details */}
          {selectedVideo && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Node Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Node Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter node title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter node description (optional)"
                />
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <IoPlay className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Video Requirement</p>
                <p>Each learning step must have a video segment. This video will be the primary content for this step in the learning flow. Start and End nodes don't require videos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedVideo || !title.trim()}
              className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                selectedVideo && title.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Node
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}