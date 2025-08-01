"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { FaVideo, FaEdit, FaPlay, FaFileVideo, FaArrowRight } from "react-icons/fa";
import { IoVideocam, IoCreate, IoClose } from "react-icons/io5";

interface GraphCreationChoiceProps {
  learningId: string;
  learningTitle: string;
  onClose?: () => void;
}

export default function GraphCreationChoice({ 
  learningId, 
  learningTitle, 
  onClose 
}: GraphCreationChoiceProps) {
  const router = useRouter();

  const handleVideoEditor = () => {
    // Store learning ID for after video editor
    localStorage.setItem('pendingLearningId', learningId);
    router.push('/video-editor');
  };

  const handleCreateManually = () => {
    router.push(`/teacher/${learningId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Learning Graph</h2>
              <p className="text-gray-600">
                Choose how you'd like to create your learning graph for "{learningTitle}"
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose className="w-6 h-6 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Editor Option */}
            <div className="group cursor-pointer" onClick={handleVideoEditor}>
              <div className="border-2 border-gray-200 rounded-xl p-6 h-full transition-all duration-300 hover:border-blue-400 hover:shadow-lg group-hover:bg-blue-50">
                <div className="text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IoVideocam className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Create with Video Editor</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Upload a video and use our smart editor to automatically create segments. 
                    Each segment becomes a learning node with the video content.
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Automatic video segmentation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>AI-powered content analysis</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Auto-generated node connections</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Time-based learning flow</span>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium group-hover:shadow-lg">
                    <FaPlay className="w-4 h-4" />
                    Start with Video Editor
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Creation Option */}
            <div className="group cursor-pointer" onClick={handleCreateManually}>
              <div className="border-2 border-gray-200 rounded-xl p-6 h-full transition-all duration-300 hover:border-green-400 hover:shadow-lg group-hover:bg-green-50">
                <div className="text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IoCreate className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Create on Your Own</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Build your learning graph from scratch. Create nodes manually, upload individual 
                    video segments, and design your own learning flow.
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Full creative control</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Custom node positioning</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Individual video uploads</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>AI model configuration</span>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium group-hover:shadow-lg">
                    <FaEdit className="w-4 h-4" />
                    Create Manually
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <FaFileVideo className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 mb-1">Video Requirements</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Each learning step must have a video segment. Start and End nodes are system nodes that don't require videos.
                  You can upload videos directly or use our editor to create segments from a longer video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}