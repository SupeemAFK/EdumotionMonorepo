"use client"

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaVideo, FaVideoSlash, FaEye, FaEyeSlash, FaChartLine, FaWifi } from "react-icons/fa";
import { useWebcamStream } from "../hooks/useWebcamStream";

interface LearningWebcamProps {
  skillId: string;
  currentStep: string;
  onProgressUpdate?: (progress: any) => void;
  onAnalysisResult?: (result: any) => void;
}

interface AnalysisResult {
  engagement: number;
  attention: number;
  confidence: number;
  timestamp: number;
  suggestions: string[];
}

export default function LearningWebcam({ 
  skillId, 
  currentStep, 
  onProgressUpdate, 
  onAnalysisResult 
}: LearningWebcamProps) {
  const [analysisEnabled, setAnalysisEnabled] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frameInterval, setFrameInterval] = useState<NodeJS.Timeout | null>(null);

  // Use the existing webcam stream hook
  const {
    videoRef,
    canvasRef,
    isStreaming,
    isConnected,
    error,
    startWebcam,
    connectWebSocket,
    startStreaming,
    stopStreaming,
  } = useWebcamStream({ 
    wsUrl: 'ws://localhost:8765',
    autoStart: false 
  });

  // Capture and analyze frame
  const captureAndAnalyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !analysisEnabled) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);

    // Convert to base64 for analysis
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = dataURL.split(',')[1];

    setIsAnalyzing(true);
    
    // Simulate analysis result (replace with actual AI analysis)
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        engagement: Math.random() * 100,
        attention: Math.random() * 100,
        confidence: Math.random() * 100,
        timestamp: Date.now(),
        suggestions: [
          "Try to maintain eye contact with the camera",
          "Consider taking notes while learning",
          "Take a short break if feeling tired",
          "Good posture helps with focus"
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      };

      setAnalysisResults(prev => [...prev.slice(-9), mockResult]);
      onAnalysisResult?.(mockResult);
      setIsAnalyzing(false);
    }, 1000);
  }, [analysisEnabled, videoRef, canvasRef, onAnalysisResult]);

  // Start analysis
  const startAnalysis = useCallback(() => {
    if (!analysisEnabled || frameInterval) return;
    
    const interval = setInterval(captureAndAnalyzeFrame, 3000); // Analyze every 3 seconds
    setFrameInterval(interval);
  }, [analysisEnabled, captureAndAnalyzeFrame, frameInterval]);

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    if (frameInterval) {
      clearInterval(frameInterval);
      setFrameInterval(null);
    }
    setIsAnalyzing(false);
  }, [frameInterval]);

  // Toggle analysis
  const toggleAnalysis = useCallback(() => {
    setAnalysisEnabled(prev => {
      const newState = !prev;
      if (newState) {
        startAnalysis();
      } else {
        stopAnalysis();
      }
      return newState;
    });
  }, [startAnalysis, stopAnalysis]);

  // Start learning session
  const startLearningSession = useCallback(async () => {
    try {
      await startWebcam();
      await connectWebSocket();
      await startStreaming();
    } catch (error) {
      console.error('Failed to start learning session:', error);
    }
  }, [startWebcam, connectWebSocket, startStreaming]);

  // Stop learning session
  const stopLearningSession = useCallback(() => {
    stopStreaming();
    stopAnalysis();
  }, [stopStreaming, stopAnalysis]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  const averageEngagement = analysisResults.length > 0 
    ? analysisResults.reduce((acc, result) => acc + result.engagement, 0) / analysisResults.length 
    : 0;

  const averageAttention = analysisResults.length > 0 
    ? analysisResults.reduce((acc, result) => acc + result.attention, 0) / analysisResults.length 
    : 0;

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Learning Session</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Video Stream */}
      <div className="mb-4">
        <div className="relative">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isStreaming && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                LIVE
              </div>
            )}
            {isConnected && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <FaWifi className="text-xs" />
                ONLINE
              </div>
            )}
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-center">
            <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">
              Learning Session - {skillId} - Step {currentStep}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <motion.button
          onClick={isStreaming ? stopLearningSession : startLearningSession}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isStreaming 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isStreaming ? <FaVideoSlash /> : <FaVideo />}
          {isStreaming ? 'Stop Session' : 'Start Session'}
        </motion.button>

        <motion.button
          onClick={toggleAnalysis}
          disabled={!isStreaming}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            analysisEnabled 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {analysisEnabled ? <FaEye /> : <FaEyeSlash />}
          {analysisEnabled ? 'Stop Analysis' : 'Start Analysis'}
        </motion.button>
      </div>

      {/* Analysis Results */}
      {analysisEnabled && analysisResults.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaChartLine className="text-blue-400" />
            <h4 className="font-medium text-white">Learning Analytics</h4>
            {isAnalyzing && (
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Engagement</span>
                <span className="text-sm font-medium text-white">
                  {Math.round(averageEngagement)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${averageEngagement}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Attention</span>
                <span className="text-sm font-medium text-white">
                  {Math.round(averageAttention)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${averageAttention}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Latest suggestions */}
          {analysisResults.length > 0 && analysisResults[analysisResults.length - 1].suggestions.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-400 mb-2">AI Suggestions</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                {analysisResults[analysisResults.length - 1].suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Progress Info */}
      <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Session Progress</span>
          <span className="text-xs text-gray-400">
            {analysisResults.length} analysis points
          </span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Skill: {skillId}</div>
          <div>Current Step: {currentStep}</div>
          <div>Status: {isStreaming ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 