"use client"

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaUpload, FaPlay, FaPause, FaStop, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress, FaCut, FaPlus, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { IoClose, IoInformationCircle } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";

interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  color: string;
}

interface VideoEditorProps {}

const VideoEditor: React.FC<VideoEditorProps> = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<VideoSegment | null>(null);
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [segmentStartTime, setSegmentStartTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<VideoSegment | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setSegments([]);
      setSelectedSegment(null);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith("video/"));
    if (videoFile) {
      handleFileUpload(videoFile);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Video controls
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Segment management
  const startAddingSegment = useCallback(() => {
    setIsAddingSegment(true);
    setSegmentStartTime(currentTime);
  }, [currentTime]);

  const finishAddingSegment = useCallback(() => {
    if (isAddingSegment && currentTime > segmentStartTime) {
      const newSegment: VideoSegment = {
        id: Date.now().toString(),
        startTime: segmentStartTime,
        endTime: currentTime,
        title: `Segment ${segments.length + 1}`,
        description: "",
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
      setSegments(prev => [...prev, newSegment]);
      setIsAddingSegment(false);
      setEditingSegment(newSegment);
      setShowSegmentModal(true);
    }
  }, [isAddingSegment, currentTime, segmentStartTime, segments.length]);

  const cancelAddingSegment = useCallback(() => {
    setIsAddingSegment(false);
  }, []);

  const deleteSegment = useCallback((segmentId: string) => {
    setSegments(prev => prev.filter(seg => seg.id !== segmentId));
    if (selectedSegment?.id === segmentId) {
      setSelectedSegment(null);
    }
  }, [selectedSegment]);

  const updateSegment = useCallback((updatedSegment: VideoSegment) => {
    setSegments(prev => prev.map(seg => seg.id === updatedSegment.id ? updatedSegment : seg));
    if (selectedSegment?.id === updatedSegment.id) {
      setSelectedSegment(updatedSegment);
    }
  }, [selectedSegment]);

  const selectSegment = useCallback((segment: VideoSegment) => {
    setSelectedSegment(segment);
    handleSeek(segment.startTime);
  }, [handleSeek]);

  // Timeline click handler
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (timelineRef.current && duration > 0) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const timelineWidth = rect.width;
      const clickedTime = (clickX / timelineWidth) * duration;
      handleSeek(clickedTime);
    }
  }, [duration, handleSeek]);

  // Format time helper
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-transparent text-white">
      {/* Upload Area */}
      {!videoFile && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              isDragging 
                ? "border-purple-500 bg-purple-500/10 shadow-xl scale-105" 
                : "border-gray-600 hover:border-purple-500/70 hover:bg-purple-500/5"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <motion.div
              animate={{ 
                y: isDragging ? -10 : 0,
                scale: isDragging ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <FaUpload className="mx-auto mb-4 text-5xl text-purple-500" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Upload Video
            </h3>
            <p className="text-gray-400 mb-6 text-base">
              Drag and drop your video file here or click to browse
            </p>
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors duration-200 text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Choose File
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
          </motion.div>
        </div>
      )}

                {/* Video Editor Interface */}
      {videoFile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          {/* Video Player */}
          <div className="flex-1 flex">
            <div className="flex-1 bg-black flex items-center justify-center relative rounded-lg m-4 overflow-hidden shadow-xl border border-gray-800">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-w-full max-h-full rounded-lg"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={togglePlay}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors duration-200 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
                  </motion.button>
                  <motion.button
                    onClick={handleStop}
                    className="p-2 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors duration-200 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaStop className="text-sm" />
                  </motion.button>
                  
                  <div className="flex items-center gap-2">
                    <motion.button 
                      onClick={toggleMute}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {isMuted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}
                    </motion.button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-2 bg-gray-700 rounded-lg appearance-none slider-thumb"
                    />
                  </div>
                  
                  <div className="flex-1 text-center">
                    <span className="text-sm font-medium text-gray-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={toggleFullscreen}
                    className="p-2 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors duration-200 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Segment Information Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 p-4 overflow-y-auto"
            >
              <h3 className="text-lg font-bold mb-4 text-white">
                Video Segments
              </h3>
              
              {/* Segment Controls */}
              <div className="mb-4 space-y-2">
                {!isAddingSegment ? (
                  <motion.button
                    onClick={startAddingSegment}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCut className="text-sm" />
                    <span className="font-medium">Start New Segment</span>
                  </motion.button>
                ) : (
                  <div className="space-y-2">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg backdrop-blur-sm"
                    >
                      <p className="text-sm text-yellow-300 font-medium">
                        Creating segment from {formatTime(segmentStartTime)}
                      </p>
                      <p className="text-xs text-yellow-400 mt-1">
                        Current: {formatTime(currentTime)}
                      </p>
                    </motion.div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={finishAddingSegment}
                        className="flex-1 p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaSave className="text-sm" />
                      </motion.button>
                      <motion.button
                        onClick={cancelAddingSegment}
                        className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IoClose className="text-sm" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>

              {/* Segments List */}
              <div className="space-y-2">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSegment?.id === segment.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => selectSegment(segment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-medium">{segment.title}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSegment(segment);
                            setShowSegmentModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSegment(segment.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                    </p>
                    {segment.description && (
                      <p className="text-xs text-gray-500">{segment.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="h-24 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 p-4"
          >
            <div className="h-full relative">
              <div
                ref={timelineRef}
                className="h-8 bg-gray-700 rounded-full relative cursor-pointer shadow-inner border border-gray-600/50"
                onClick={handleTimelineClick}
              >
                {/* Progress Bar */}
                <div
                  className="h-full bg-purple-600 rounded-full shadow-lg"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* Playhead */}
                <motion.div
                  className="absolute top-0 w-1 h-full bg-white rounded-full transform -translate-x-1/2 shadow-lg"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                  animate={{ 
                    boxShadow: isPlaying ? "0 0 8px rgba(255, 255, 255, 0.6)" : "0 0 4px rgba(255, 255, 255, 0.3)" 
                  }}
                />
                
                {/* Segments on Timeline */}
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="absolute top-0 h-full rounded-full opacity-60 hover:opacity-80 cursor-pointer"
                    style={{
                      left: `${(segment.startTime / duration) * 100}%`,
                      width: `${((segment.endTime - segment.startTime) / duration) * 100}%`,
                      backgroundColor: segment.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSegment(segment);
                    }}
                    title={segment.title}
                  />
                ))}
                
                {/* Adding Segment Preview */}
                {isAddingSegment && (
                  <div
                    className="absolute top-0 h-full bg-yellow-500 opacity-50 rounded-full"
                    style={{
                      left: `${(segmentStartTime / duration) * 100}%`,
                      width: `${((currentTime - segmentStartTime) / duration) * 100}%`,
                    }}
                  />
                )}
              </div>
              
              {/* Time Labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-3">
                <span className="font-medium">0:00</span>
                <span className="font-medium">{formatTime(duration)}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Segment Modal */}
      <AnimatePresence>
        {showSegmentModal && editingSegment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowSegmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 w-96 max-w-90vw border border-gray-700/50 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Edit Segment
                </h3>
                <motion.button
                  onClick={() => setShowSegmentModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoClose size={20} />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingSegment.title}
                    onChange={(e) => setEditingSegment({...editingSegment, title: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingSegment.description}
                    onChange={(e) => setEditingSegment({...editingSegment, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={editingSegment.color}
                    onChange={(e) => setEditingSegment({...editingSegment, color: e.target.value})}
                    className="w-full h-10 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="number"
                      value={editingSegment.startTime}
                      onChange={(e) => setEditingSegment({...editingSegment, startTime: parseFloat(e.target.value)})}
                      min="0"
                      max={duration}
                      step="0.1"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="number"
                      value={editingSegment.endTime}
                      onChange={(e) => setEditingSegment({...editingSegment, endTime: parseFloat(e.target.value)})}
                      min="0"
                      max={duration}
                      step="0.1"
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => {
                    updateSegment(editingSegment);
                    setShowSegmentModal(false);
                    setEditingSegment(null);
                  }}
                  className="flex-1 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
                <motion.button
                  onClick={() => setShowSegmentModal(false)}
                  className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoEditor; 