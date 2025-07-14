import { useRef, useEffect, useState, useCallback } from 'react';

export function useWebcamStream({ wsUrl = 'ws://localhost:8765', autoStart = false } = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError('');
    } catch (err) {
      setError('Failed to access webcam');
      console.error('Webcam error:', err);
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        setIsConnected(true);
      };
      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsStreaming(false);
      };
      wsRef.current.onerror = (error) => {
        setError('WebSocket connection failed');
        console.error('WebSocket error:', error);
      };
      wsRef.current.onmessage = (event) => {
        // Optionally handle server messages
      };
    } catch (err) {
      setError('Failed to connect to server');
    }
  }, [wsUrl]);

  // Capture and send frame
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = dataURL.split(',')[1];
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'frame',
        data: base64Data,
        timestamp: Date.now()
      }));
    }
  }, []);

  // Start streaming
  const startStreaming = useCallback(() => {
    if (!isConnected) {
      setError('Please connect to server first');
      return;
    }
    setIsStreaming(true);
    intervalRef.current = setInterval(captureFrame, 100);
  }, [isConnected, captureFrame]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    if (autoStart) {
      startWebcam();
      connectWebSocket();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoStart, startWebcam, connectWebSocket]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    isConnected,
    error,
    startWebcam,
    connectWebSocket,
    startStreaming,
    stopStreaming,
  };
} 