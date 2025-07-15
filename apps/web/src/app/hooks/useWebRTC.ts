import { useRef, useEffect, useState, useCallback } from 'react';

interface WebRTCConfig {
  wsUrl?: string;
  stunServers?: string[];
  autoStart?: boolean;
  roomId?: string;
}

interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export function useWebRTC({
  wsUrl = 'ws://localhost:8765',
  stunServers = ['stun:stun.l.google.com:19302'],
  autoStart = false,
  roomId = 'default-room'
}: WebRTCConfig = {}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  const [peers, setPeers] = useState<string[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: stunServers.map(server => ({ urls: server }))
  };

  // Initialize local media stream
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsStreaming(true);
      setError('');
      return stream;
    } catch (err) {
      setError('Failed to access camera/microphone');
      console.error('Media access error:', err);
      return null;
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string) => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetPeer: peerId,
          roomId
        }));
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setIsCallActive(true);
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        setIsCallActive(false);
      }
    };

    const peer: PeerConnection = {
      id: peerId,
      connection: peerConnection
    };

    peerConnectionsRef.current.set(peerId, peer);
    return peerConnection;
  }, [roomId, rtcConfig]);

  // Connect to WebSocket signaling server
  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        // Join room
        wsRef.current!.send(JSON.stringify({
          type: 'join-room',
          roomId
        }));
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsCallActive(false);
        setPeers([]);
      };

      wsRef.current.onerror = (error) => {
        setError('WebSocket connection failed');
        console.error('WebSocket error:', error);
      };

      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'room-joined':
            setPeers(message.peers || []);
            break;
            
          case 'peer-joined':
            setPeers(prev => [...prev, message.peerId]);
            break;
            
          case 'peer-left':
            setPeers(prev => prev.filter(id => id !== message.peerId));
            const leavingPeer = peerConnectionsRef.current.get(message.peerId);
            if (leavingPeer) {
              leavingPeer.connection.close();
              peerConnectionsRef.current.delete(message.peerId);
            }
            break;
            
          case 'offer':
            const offerPeer = createPeerConnection(message.fromPeer);
            await offerPeer.setRemoteDescription(message.offer);
            const answer = await offerPeer.createAnswer();
            await offerPeer.setLocalDescription(answer);
            wsRef.current!.send(JSON.stringify({
              type: 'answer',
              answer,
              targetPeer: message.fromPeer,
              roomId
            }));
            break;
            
          case 'answer':
            const answerPeer = peerConnectionsRef.current.get(message.fromPeer);
            if (answerPeer) {
              await answerPeer.connection.setRemoteDescription(message.answer);
            }
            break;
            
          case 'ice-candidate':
            const candidatePeer = peerConnectionsRef.current.get(message.fromPeer);
            if (candidatePeer) {
              await candidatePeer.connection.addIceCandidate(message.candidate);
            }
            break;
            
          case 'learning-progress':
            // Handle learning progress updates from other peers
            console.log('Learning progress:', message.progress);
            break;
        }
      };
    } catch (err) {
      setError('Failed to connect to signaling server');
      console.error('WebSocket connection error:', err);
    }
  }, [wsUrl, roomId, createPeerConnection]);

  // Start video call with a peer
  const startCall = useCallback(async (peerId: string) => {
    if (!localStreamRef.current) {
      await startLocalStream();
    }
    
    const peerConnection = createPeerConnection(peerId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'offer',
        offer,
        targetPeer: peerId,
        roomId
      }));
    }
  }, [createPeerConnection, startLocalStream, roomId]);

  // End all calls
  const endCall = useCallback(() => {
    peerConnectionsRef.current.forEach(peer => {
      peer.connection.close();
    });
    peerConnectionsRef.current.clear();
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setIsCallActive(false);
  }, []);

  // Send learning progress to peers
  const sendLearningProgress = useCallback((progress: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'learning-progress',
        progress,
        roomId
      }));
    }
  }, [roomId]);

  // Send frame data for AI analysis
  const sendFrameForAnalysis = useCallback((frameData: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'frame-analysis',
        data: frameData,
        timestamp: Date.now(),
        roomId
      }));
    }
  }, [roomId]);

  // Cleanup
  useEffect(() => {
    if (autoStart) {
      startLocalStream();
      connectWebSocket();
    }
    
    return () => {
      stopLocalStream();
      endCall();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoStart, startLocalStream, connectWebSocket, stopLocalStream, endCall]);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isStreaming,
    isCallActive,
    peers,
    error,
    startLocalStream,
    stopLocalStream,
    connectWebSocket,
    startCall,
    endCall,
    sendLearningProgress,
    sendFrameForAnalysis
  };
} 