"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand } from 'react-icons/fa';

interface VideoPlayerProps {
  src: string;
  startTime?: number;
  endTime?: number;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export default function VideoPlayer({ 
  src, 
  startTime = 0, 
  endTime, 
  className = "",
  autoPlay = false,
  showControls = true,
  onTimeUpdate,
  onEnded
}: VideoPlayerProps) {
  // Debug props
  useEffect(() => {
    console.log('🎥 VideoPlayer props:', { 
      src: src?.substring(0, 50) + '...', 
      startTime, 
      endTime,
      hasValidSrc: !!src && src.length > 0
    });
  }, [src, startTime, endTime]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // Format time helper
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(endTime || video.duration);
      setIsLoading(false);
      
      // Set initial time to startTime for segments
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };

    const handleError = (e: Event) => {
      console.error('Video loading error:', e);
      console.error('Video src:', src);
      setError('Failed to load video');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);
      
      // For video segments, stop playback when reaching endTime
      if (endTime && currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        onEnded?.();
      }
      
      onTimeUpdate?.(currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [src, startTime, endTime, onTimeUpdate, onEnded]);

  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // For segments, ensure we start from the correct time
      if (startTime > 0 && video.currentTime < startTime) {
        video.currentTime = startTime;
      }
      video.play();
    }
  }, [isPlaying, startTime]);

  // Seek to specific time
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = parseFloat(e.target.value);
    
    // For segments, constrain seeking within the segment bounds
    const constrainedTime = Math.max(startTime, Math.min(seekTime, endTime || video.duration));
    
    video.currentTime = constrainedTime;
    setCurrentTime(constrainedTime);
  }, [startTime, endTime]);

  // Volume control
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }, []);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-sm">Failed to load video</div>
          <div className="text-xs mt-1">{error}</div>
        </div>
      </div>
    );
  }

  const segmentDuration = endTime ? endTime - startTime : duration;
  const segmentCurrentTime = Math.max(0, currentTime - startTime);
  const progressPercentage = segmentDuration > 0 ? (segmentCurrentTime / segmentDuration) * 100 : 0;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
          >
            {isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      {showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Progress Bar */}
          <div className="mb-2">
            <input
              type="range"
              min={startTime}
              max={endTime || duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs">
            {/* Time Display */}
            <div className="flex items-center gap-2">
              <span>{formatTime(segmentCurrentTime)}</span>
              <span>/</span>
              <span>{formatTime(segmentDuration)}</span>
              {endTime && (
                <span className="text-yellow-400 ml-2">
                  (Segment: {formatTime(startTime)} - {formatTime(endTime)})
                </span>
              )}
            </div>

            {/* Volume and Fullscreen */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">
                {isMuted ? <FaVolumeMute className="w-3 h-3" /> : <FaVolumeUp className="w-3 h-3" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <button onClick={toggleFullscreen} className="hover:text-blue-400 transition-colors">
                <FaExpand className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}