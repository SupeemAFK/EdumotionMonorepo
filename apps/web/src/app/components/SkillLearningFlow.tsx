"use client"

import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  ReactFlowProvider,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from "motion/react";
import { FaPlay, FaPause, FaCheck, FaLock, FaArrowLeft, FaBookOpen, FaClock, FaUser, FaRunning, FaSearch, FaRobot, FaVolumeUp, FaStar, FaThumbsUp, FaLightbulb } from "react-icons/fa";
import { useRouter } from "next/navigation";
import SkillLearningNode from "./SkillLearningNode";
import LearningWebcam from "./LearningWebcam";
import { api } from '@/lib/api';

interface SkillLearningFlowProps {
  skillId: string;
  learningData?: any;
  userId?: string;
  learningProgress?: any;
  isLoadingProgress?: boolean;
  refetchProgress?: () => void;
  speechMatch: boolean;
}

interface SkillNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  video: string;
  status: 'completed' | 'current' | 'locked' | 'available';
  duration: string;
  type?: string;
  threshold?: number;
  videoData?: {
    url: string;
    startTime?: number;
    endTime?: number;
    isSegment?: boolean;
    originalFileName?: string;
    segmentTitle?: string;
  };
  videoSegments?: {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    description: string;
  }[];
}

// Mock data for skill learning flow
const getSkillData = (skillId: string) => {
  const skillsData: Record<string, any> = {
    "1": {
      title: "Basic Circuit Building",
      description: "Learn to build simple electronic circuits with LEDs, resistors, and batteries",
      creator: "Dr. Sarah Electronics",
      totalDuration: "2h 30m",
      nodes: [
        {
          id: "1",
          position: { x: 0, y: 0 },
          data: {
            label: "Circuit Basics",
            description: "Learn about basic electronic components: resistors, LEDs, and batteries",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "completed",
            duration: "15 min",
            videoSegments: [
              {
                id: "seg1",
                title: "Understanding Resistors",
                startTime: 0,
                endTime: 300,
                description: "What resistors do and how to read their values"
              },
              {
                id: "seg2",
                title: "LED Basics",
                startTime: 300,
                endTime: 600,
                description: "How LEDs work and their polarity"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "2",
          position: { x: 0, y: 400 },
          data: {
            label: "First LED Circuit",
            description: "Build your first simple LED circuit with a battery and resistor",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "completed",
            duration: "25 min",
            videoSegments: [
              {
                id: "seg3",
                title: "Circuit Assembly",
                startTime: 0,
                endTime: 400,
                description: "Step-by-step circuit assembly on breadboard"
              },
              {
                id: "seg4",
                title: "Testing Your Circuit",
                startTime: 400,
                endTime: 800,
                description: "How to test and troubleshoot your circuit"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "3",
          position: { x: 0, y: 800 },
          data: {
            label: "Series & Parallel",
            description: "Experiment with series and parallel LED configurations",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "current",
            duration: "30 min",
            videoSegments: [
              {
                id: "seg5",
                title: "Series Circuits",
                startTime: 0,
                endTime: 500,
                description: "Building LEDs in series configuration"
              },
              {
                id: "seg6",
                title: "Parallel Circuits",
                startTime: 500,
                endTime: 1000,
                description: "Building LEDs in parallel configuration"
              },
              {
                id: "seg7",
                title: "Comparing Configurations",
                startTime: 1000,
                endTime: 1500,
                description: "Understanding differences between series and parallel"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "4",
          position: { x: 0, y: 1200 },
          data: {
            label: "Switch Control",
            description: "Add switches to control your LED circuits interactively",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "available",
            duration: "35 min"
          },
          type: "skillLearningNode",
        },
        {
          id: "5",
          position: { x: 0, y: 1600 },
          data: {
            label: "Variable Resistors",
            description: "Use potentiometers to control LED brightness",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "locked",
            duration: "40 min"
          },
          type: "skillLearningNode",
        },
        {
          id: "6",
          position: { x: 0, y: 2000 },
          data: {
            label: "Final Project",
            description: "Create a multi-LED display with different patterns and controls",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "locked",
            duration: "45 min"
          },
          type: "skillLearningNode",
        }
      ],
      edges: [
        { 
          id: "e1-2", 
          type: "smoothstep",
          source: "1", 
          target: "2", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e2-3", 
          type: "smoothstep",
          source: "2", 
          target: "3", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e3-4", 
          type: "smoothstep",
          source: "3", 
          target: "4", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e4-5", 
          type: "smoothstep",
          source: "4", 
          target: "5", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e5-6", 
          type: "smoothstep",
          source: "5", 
          target: "6", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        }
      ]
    },
    "2": {
      title: "Guitar Chord Mastery",
      description: "Master essential guitar chords and strumming patterns",
      creator: "Jake Martinez",
      totalDuration: "3h 15m",
      nodes: [
        {
          id: "1",
          position: { x: 0, y: 0 },
          data: {
            label: "Guitar Basics",
            description: "Learn guitar anatomy, proper posture, and hand positioning",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "completed",
            duration: "20 min",
            videoSegments: [
              {
                id: "seg1",
                title: "Guitar Anatomy",
                startTime: 0,
                endTime: 400,
                description: "Understanding parts of the guitar"
              },
              {
                id: "seg2",
                title: "Proper Posture",
                startTime: 400,
                endTime: 800,
                description: "How to hold the guitar correctly"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "2",
          position: { x: 0, y: 400 },
          data: {
            label: "First Chords",
            description: "Learn your first three chords: G, C, and D",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "completed",
            duration: "30 min",
            videoSegments: [
              {
                id: "seg3",
                title: "G Major Chord",
                startTime: 0,
                endTime: 500,
                description: "Finger placement for G major chord"
              },
              {
                id: "seg4",
                title: "C Major Chord",
                startTime: 500,
                endTime: 1000,
                description: "Finger placement for C major chord"
              },
              {
                id: "seg5",
                title: "D Major Chord",
                startTime: 1000,
                endTime: 1500,
                description: "Finger placement for D major chord"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "3",
          position: { x: 0, y: 800 },
          data: {
            label: "Chord Transitions",
            description: "Practice smooth transitions between chords",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "current",
            duration: "35 min",
            videoSegments: [
              {
                id: "seg6",
                title: "G to C Transition",
                startTime: 0,
                endTime: 600,
                description: "Smooth transition from G to C chord"
              },
              {
                id: "seg7",
                title: "C to D Transition",
                startTime: 600,
                endTime: 1200,
                description: "Smooth transition from C to D chord"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "4",
          position: { x: 0, y: 1200 },
          data: {
            label: "Strumming Patterns",
            description: "Learn basic strumming patterns and rhythm",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "available",
            duration: "40 min"
          },
          type: "skillLearningNode",
        },
        {
          id: "5",
          position: { x: 0, y: 1600 },
          data: {
            label: "Your First Song",
            description: "Play your first complete song using learned chords",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "locked",
            duration: "30 min"
          },
          type: "skillLearningNode",
        }
      ],
      edges: [
        { 
          id: "e1-2", 
          type: "smoothstep",
          source: "1", 
          target: "2", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e2-3", 
          type: "smoothstep",
          source: "2", 
          target: "3", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e3-4", 
          type: "smoothstep",
          source: "3", 
          target: "4", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e4-5", 
          type: "smoothstep",
          source: "4", 
          target: "5", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        }
      ]
    },
    "3": {
      title: "Digital Art Fundamentals",
      description: "Create stunning digital artwork using drawing tablets and software",
      creator: "Emma Creative",
      totalDuration: "4h 45m",
      nodes: [
        {
          id: "1",
          position: { x: 0, y: 0 },
          data: {
            label: "Digital Art Setup",
            description: "Set up your drawing tablet and digital art software",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "completed",
            duration: "25 min",
            videoSegments: [
              {
                id: "seg1",
                title: "Tablet Installation",
                startTime: 0,
                endTime: 500,
                description: "Installing and configuring your drawing tablet"
              },
              {
                id: "seg2",
                title: "Software Overview",
                startTime: 500,
                endTime: 1000,
                description: "Introduction to digital art software interface"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "2",
          position: { x: 0, y: 400 },
          data: {
            label: "Basic Brush Techniques",
            description: "Learn fundamental brush strokes and pressure sensitivity",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "completed",
            duration: "35 min",
            videoSegments: [
              {
                id: "seg3",
                title: "Brush Selection",
                startTime: 0,
                endTime: 600,
                description: "Choosing the right brushes for different effects"
              },
              {
                id: "seg4",
                title: "Pressure Sensitivity",
                startTime: 600,
                endTime: 1200,
                description: "Using pressure to control line weight and opacity"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "3",
          position: { x: 0, y: 800 },
          data: {
            label: "Color Theory",
            description: "Understanding colors, palettes, and color harmony",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "current",
            duration: "40 min",
            videoSegments: [
              {
                id: "seg5",
                title: "Color Wheel",
                startTime: 0,
                endTime: 700,
                description: "Understanding the color wheel and relationships"
              },
              {
                id: "seg6",
                title: "Creating Palettes",
                startTime: 700,
                endTime: 1400,
                description: "How to create harmonious color palettes"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "4",
          position: { x: 0, y: 1200 },
          data: {
            label: "Shading & Lighting",
            description: "Learn to create depth with shadows and highlights",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "available",
            duration: "45 min"
          },
          type: "skillLearningNode",
        },
        {
          id: "5",
          position: { x: 0, y: 1600 },
          data: {
            label: "Your First Artwork",
            description: "Create your first complete digital artwork",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "locked",
            duration: "60 min"
          },
          type: "skillLearningNode",
        }
      ],
      edges: [
        { 
          id: "e1-2", 
          type: "smoothstep",
          source: "1", 
          target: "2", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e2-3", 
          type: "smoothstep",
          source: "2", 
          target: "3", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e3-4", 
          type: "smoothstep",
          source: "3", 
          target: "4", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        },
        { 
          id: "e4-5", 
          type: "smoothstep",
          source: "4", 
          target: "5", 
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          animated: true 
        }
      ]
    }
  };

  return skillsData[skillId] || skillsData["1"];
};

const nodeTypes = { skillLearningNode: SkillLearningNode };

function SkillLearningFlowContent({ skillId, learningData, userId, learningProgress, isLoadingProgress, refetchProgress, speechMatch }: SkillLearningFlowProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'success' | 'error' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const [typedText, setTypedText] = useState('');
  
  // Typing effect for TTS text
  useEffect(() => {
    if (!isSpeaking || !speakingText) {
      setTypedText('');
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index <= speakingText.length) {
        setTypedText(speakingText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, [isSpeaking, speakingText]);
  
  // Log component render state for debugging
  console.log('🔄 SkillLearningFlow rendering with:', {
    skillId,
    hasLearningData: !!learningData,
    hasUserId: !!userId,
    hasLearningProgress: !!learningProgress,
    isLoadingProgress,
    learningProgressCurrentNode: learningProgress?.currentNode,
    timestamp: new Date().toISOString()
  });
  
  // Convert API data to the format expected by the component
  const convertApiDataToSkillData = (apiData: any) => {
    if (!apiData?.learning) {
      return getSkillData(skillId); // Fallback to mock data
    }

    const learning = apiData.learning;
    
    // Sort nodes by creation date to maintain order
    const sortedNodes = [...learning.nodes].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Find start and end nodes
    const startNode = sortedNodes.find((node: any) => node.type === 'start');
    const endNode = sortedNodes.find((node: any) => node.type === 'end');
    const learningNodes = sortedNodes.filter((node: any) => node.type !== 'start' && node.type !== 'end');

    // Determine current node based on learning progress
    let currentNodeId = learningNodes[0]?.id; // Default to first learning node
    
    if (learningProgress?.currentNode) {
      currentNodeId = learningProgress.currentNode;
      console.log('📍 Using learning progress current node:', {
        currentNodeId: currentNodeId,
        progressUpdated: learningProgress.updatedAt,
        progressCreated: learningProgress.createdAt
      });
    } else if (isLoadingProgress) {
      console.log('⏳ Still loading progress, using default first node temporarily');
    } else {
      console.log('🆕 No learning progress found, using first learning node:', currentNodeId);
    }
    
    // Convert nodes to the expected format
    const convertedNodes = sortedNodes.map((node: any, index: number) => {
      let status: 'completed' | 'current' | 'locked' | 'available' = 'locked';
      
      if (node.type === 'start' || node.type === 'end') {
        // Start and end nodes are not interactive
        status = 'locked';
        console.log(`🔒 ${node.type.toUpperCase()} node (${node.title}): status = locked`);
      } else if (node.id === currentNodeId) {
        // Current active node based on API progress
        status = 'current';
        console.log(`🎯 CURRENT node (${node.title}): status = current (from API currentNode: ${currentNodeId})`);
      } else {
        // Determine status based on position relative to current node
        const nodeIndex = learningNodes.findIndex((n: any) => n.id === node.id);
        const currentIndex = learningNodes.findIndex((n: any) => n.id === currentNodeId);
        
        if (nodeIndex < currentIndex) {
          // Nodes before current are completed (done)
          status = 'completed';
          console.log(`✅ PREVIOUS node (${node.title}): status = completed (position ${nodeIndex} < current ${currentIndex})`);
        } else if (nodeIndex === currentIndex + 1) {
          // Next node after current is available (ready)
          status = 'available';
          console.log(`🟡 NEXT node (${node.title}): status = available (position ${nodeIndex} = current ${currentIndex} + 1)`);
        } else {
          // All other future nodes are locked
          status = 'locked';
          console.log(`🔒 FUTURE node (${node.title}): status = locked (position ${nodeIndex} > current ${currentIndex} + 1)`);
        }
      }

      // Handle different video URL formats
      let videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Default fallback
      let videoData = null;
      
      if (node.video) {
        try {
          // Try to parse as JSON (video segment data)
          videoData = JSON.parse(node.video);
          if (videoData.url) {
            videoUrl = videoData.url;
            console.log(`🎬 Video segment detected for ${node.title}:`, {
              originalUrl: videoData.url,
              startTime: videoData.startTime,
              endTime: videoData.endTime,
              isSegment: videoData.isSegment
            });
          }
        } catch {
          // Not JSON, treat as regular URL
          videoUrl = node.video;
          console.log(`🎬 Regular video URL for ${node.title}:`, videoUrl);
        }
      }
      
      console.log(`🎬 Converting node ${node.title}:`, {
        originalVideo: node.video,
        finalVideoUrl: videoUrl,
        hasOriginalVideo: !!node.video,
        nodeType: node.type,
        status: status,
        isSegment: !!videoData
      });

      return {
        id: node.id,
        position: { x: node.positionX || 0, y: node.positionY || (index * 400) },
        data: {
          label: node.title,
          description: node.description,
          video: videoUrl,
          status: status,
          duration: videoData && videoData.startTime !== undefined && videoData.endTime !== undefined 
            ? `${Math.ceil((videoData.endTime - videoData.startTime) / 60)} min`
            : "15 min",
          materials: node.materials,
          type: node.type,
          videoData: videoData, // Include the parsed video data for segments
        },
        type: "skillLearningNode",
      };
    });

    // Convert edges to the expected format
    const convertedEdges = learning.edges.map((edge: any) => ({
      id: edge.id,
      type: "smoothstep",
      source: edge.fromNode,
      target: edge.toNode,
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      animated: true,
    }));

    // Log summary of node statuses
    const statusSummary = convertedNodes.reduce((acc: any, node) => {
      const status = node.data.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Node Status Summary:', {
      currentNodeFromAPI: currentNodeId,
      totalNodes: convertedNodes.length,
      statusBreakdown: statusSummary,
      completedNodes: convertedNodes.filter(n => n.data.status === 'completed').map(n => n.data.label),
      currentNode: convertedNodes.find(n => n.data.status === 'current')?.data.label,
      availableNodes: convertedNodes.filter(n => n.data.status === 'available').map(n => n.data.label),
      lockedNodes: convertedNodes.filter(n => n.data.status === 'locked').map(n => n.data.label)
    });

    return {
      title: learning.title,
      description: learning.description,
      creator: learning.creator?.name || "Unknown",
      totalDuration: "2h 30m", // Could be calculated from nodes
      nodes: convertedNodes,
      edges: convertedEdges,
    };
  };

  // If we're still loading progress and we have a user, don't render yet
  if (userId && isLoadingProgress) {
    console.log('⏳ SkillLearningFlow: Waiting for progress to load before rendering nodes');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  const skillData = learningData ? convertApiDataToSkillData(learningData) : getSkillData(skillId);
  const [nodes, setNodes, onNodesChange] = useNodesState(skillData.nodes);
  const [edges, , onEdgesChange] = useEdgesState(skillData.edges);
  const [selectedNode, setSelectedNode] = useState<Node<SkillNodeData> | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Update nodes when learning progress changes
  useEffect(() => {
    if (learningData && !isLoadingProgress) {
      console.log('🔄 Learning progress changed, updating node states:', {
        currentNode: learningProgress?.currentNode,
        hasProgress: !!learningProgress
      });
      
      const updatedSkillData = convertApiDataToSkillData(learningData);
      setNodes(updatedSkillData.nodes);
    }
  }, [learningProgress, isLoadingProgress, learningData, setNodes]);

  // Running person animation component
  const RunningPersonAnimation = () => (
    <div className="flex items-center gap-1 relative w-16 h-6">
      <motion.div
        className="absolute"
        animate={{
          x: [0, 45],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <FaRunning className="text-white text-sm" />
      </motion.div>
      <div className="flex items-center gap-1 ml-12">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-white rounded-full"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const typedNode = node as Node<SkillNodeData>;
    // Prevent clicking on locked nodes, start nodes, or end nodes
    if (typedNode.data.status === 'locked' || 
        typedNode.data.type === 'start' || 
        typedNode.data.type === 'end') {
      console.log(`🚫 Node click blocked:`, {
        nodeId: typedNode.id,
        title: typedNode.data.label,
        status: typedNode.data.status,
        type: typedNode.data.type
      });
      return;
    }
    
    console.log(`🎯 Node clicked:`, {
      nodeId: typedNode.id,
      title: typedNode.data.label,
      video: typedNode.data.video,
      hasVideo: !!typedNode.data.video,
      status: typedNode.data.status,
      type: typedNode.data.type
    });
    
    setSelectedNode(typedNode);
  }, []);

  useEffect(() => {
    if (speechMatch && currentNode) {
      handleCheckCorrect(currentNode.id);
    }
  }, [speechMatch]);

  const handleCheckCorrect = useCallback(async (nodeId: string) => {
    console.log('🔍 Check if correct clicked for node:', nodeId);
    
    // Set loading state
    setIsChecking(true);
    setCheckResult(null);
    
    // Find the current node
    const node = nodes.find(n => n.id === nodeId) as Node<SkillNodeData> | undefined;
    if (!node) {
      console.error('Node not found:', nodeId);
      setIsChecking(false);
      return;
    }

    // Get the video URL from the node
    const videoUrl = node.data.videoData?.url || node.data.video;
    if (!videoUrl) {
      console.error('No video found for node:', nodeId);
      setIsChecking(false);
      return;
    }

    try {
      // Send video URL and threshold to our proxy API
      const requestBody = {
        video_url: videoUrl,
        threshold: parseFloat(node.data.threshold?.toString() || '0.5')
      };

      console.log('🚀 Sending VLM inference request:', requestBody);

      // Call our proxy API route
      const response = await fetch('/api/vlm-inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🎯 VLM Inference Response:', result);

      // Check if the answer is correct
      const isCorrect = result.external_api_response?.is_above_threshold === "YES";
      
      if (isCorrect) {
        console.log('✅ Answer is correct! Moving to next node...');
        setCheckResult('success');
        
        // Play success sound
        playSuccessSound();
        
        // Find the next node in the learning sequence
        const currentNodeIndex = nodes.findIndex(n => n.id === nodeId);
        const nextNode = nodes[currentNodeIndex + 1];
        
        if (nextNode && nextNode.data.type !== 'end') {
          // Update learning progress via backend API
          try {
            const progressResponse = await api.post('/learnprogress/create-or-update', {
              userId: userId || skillId, // Use actual user ID if available
              learningId: skillId,
              currentNode: nextNode.id,
            });
            
            console.log('📈 Progress updated:', progressResponse.data);
            
                        // Update local state to reflect the change
    setNodes((nds) =>
              nds.map((n) => {
                if (n.id === nodeId) {
                  return { ...n, data: { ...n.data, status: 'completed' as const } };
                } else if (n.id === nextNode.id) {
                  return { ...n, data: { ...n.data, status: 'current' as const } };
                }
                return n;
              })
            );
            
            // Refetch progress to sync with backend
            if (refetchProgress) {
              console.log('🔄 Refetching progress from backend...');
              refetchProgress();
            }
            
          } catch (progressError) {
            console.error('❌ Failed to update progress:', progressError);
          }
        } else {
          console.log('🎉 Learning completed! No more nodes.');
        }
        
        // Close modal after success
        setTimeout(() => {
    setSelectedNode(null);
          setCheckResult(null);
        }, 2000);
        
              } else {
          console.log('❌ Answer is incorrect.');
          const suggestions_th = result.external_api_response?.suggestions_th;
          console.log('💡 Suggestions (Thai):', suggestions_th);
          setCheckResult('error');
          
          // Send Thai suggestions to TTS API
          if (suggestions_th && suggestions_th.trim()) {
            sendToTTS(suggestions_th);
          } else {
            console.log('⚠️ No Thai suggestions available for TTS');
          }
          
          // Auto-hide error state after 3 seconds
          setTimeout(() => {
            setCheckResult(null);
          }, 3000);
        }
      
    } catch (error) {
      console.error('💥 Error calling VLM inference API:', error);
      setCheckResult('error');
      
      // Auto-hide error state after 3 seconds
      setTimeout(() => {
        setCheckResult(null);
      }, 3000);
    } finally {
      setIsChecking(false);
    }
  }, [nodes, skillId, setNodes, setSelectedNode]);

  // Function to send suggestions to TTS API and play audio
  const sendToTTS = async (suggestions: string) => {
    try {
      console.log('🔊 Sending suggestions to TTS API:', suggestions);
      
      // Start speaking UI
      setIsSpeaking(true);
      setSpeakingText(suggestions);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: suggestions
        }),
      });
      
      if (response.ok) {
        console.log('✅ TTS request successful - received audio file');
        
        // Get audio blob and play it
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.onloadeddata = () => {
          console.log('🎵 TTS audio loaded, playing Thai suggestions...');
          audio.play().catch(err => {
            console.error('❌ Failed to play TTS audio:', err);
            setIsSpeaking(false);
            setSpeakingText('');
          });
        };
        
        audio.onended = () => {
          console.log('🎵 TTS audio finished playing');
          URL.revokeObjectURL(audioUrl); // Clean up
          setIsSpeaking(false);
          setSpeakingText('');
        };
        
        audio.onerror = (err) => {
          console.error('❌ TTS audio playback error:', err);
          URL.revokeObjectURL(audioUrl); // Clean up
          setIsSpeaking(false);
          setSpeakingText('');
        };
        
      } else {
        console.error('❌ TTS request failed:', response.status, response.statusText);
        setIsSpeaking(false);
        setSpeakingText('');
      }
      
    } catch (error) {
      console.error('💥 Error sending to TTS API:', error);
      setIsSpeaking(false);
      setSpeakingText('');
    }
  };

  // Function to play success sound
  const playSuccessSound = () => {
    try {
      // Create a simple success sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a short success melody
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.2); // C5
      playTone(659.25, now + 0.15, 0.2); // E5
      playTone(783.99, now + 0.3, 0.3); // G5
      
    } catch (e) {
      console.log('Audio not available:', e);
      // Fallback: try to use a simple beep sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgfCCWN1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+Dy');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Could not play fallback sound:', e));
      } catch (fallbackError) {
        console.log('Fallback audio not available:', fallbackError);
      }
    }
  };

  // Test function to simulate a successful response
  const handleTestSuccess = useCallback(async (nodeId: string) => {
    console.log('🧪 TEST: Simulating successful response for node:', nodeId);
    
    setIsChecking(true);
    setCheckResult(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ TEST: Answer is correct! Moving to next node...');
    setCheckResult('success');
    
    // Play success sound
    playSuccessSound();
    
    // Find the next node in the learning sequence
    const currentNodeIndex = nodes.findIndex(n => n.id === nodeId);
    const nextNode = nodes[currentNodeIndex + 1];
    
    if (nextNode && nextNode.data.type !== 'end') {
      // Update learning progress via backend API
      try {
        console.log('🚀 TEST: Calling API to update progress...', {
          endpoint: '/learnprogress/create-or-update',
          userId: userId || skillId,
          learningId: skillId,
          currentNode: nextNode.id,
          nextNodeTitle: nextNode.data.label
        });
        
        const progressResponse = await api.post('/learnprogress/create-or-update', {
          userId: userId || skillId,
          learningId: skillId,
          currentNode: nextNode.id,
        });
        
        console.log('✅ TEST: API call successful! Progress updated:', {
          response: progressResponse.data,
          status: progressResponse.status,
          statusText: progressResponse.statusText
        });
        
        // Update local state to reflect the change
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              console.log('📝 TEST: Marking node as completed:', n.data.label);
              return { ...n, data: { ...n.data, status: 'completed' as const } };
            } else if (n.id === nextNode.id) {
              console.log('🎯 TEST: Setting next node as current:', n.data.label);
              return { ...n, data: { ...n.data, status: 'current' as const } };
            }
            return n;
          })
        );
        
        console.log('🔄 TEST: Local state updated successfully!');
        
        // Refetch progress to sync with backend
        if (refetchProgress) {
          console.log('🔄 TEST: Refetching progress from backend...');
          refetchProgress();
        }
        
      } catch (progressError) {
        console.error('❌ TEST: API call failed!', {
          error: progressError,
          message: progressError instanceof Error ? progressError.message : 'Unknown error',
          endpoint: '/learnprogress/create-or-update'
        });
      }
    } else {
      console.log('🎉 TEST: Learning completed! No more nodes to progress to.');
    }
    
    // Close modal after success
    setTimeout(() => {
    setSelectedNode(null);
      setCheckResult(null);
    }, 2000);
    
    setIsChecking(false);
  }, [nodes, skillId, userId, setNodes, setSelectedNode, playSuccessSound]);

  const handleBack = () => {
    router.push('/');
  };

  const currentNode = nodes.find(node => (node.data as SkillNodeData).status === 'current') as Node<SkillNodeData> | undefined;
  const completedNodes = nodes.filter(node => (node.data as SkillNodeData).status === 'completed');
  const totalLearningNodes = nodes.filter(node => (node.data as SkillNodeData).type !== 'start' && (node.data as SkillNodeData).type !== 'end').length;
  const progress = totalLearningNodes > 0 ? (completedNodes.length / totalLearningNodes) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleBack}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="text-sm text-gray-700" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{skillData.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaUser className="text-xs" />
                  <span>{skillData.creator}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="text-xs" />
                  <span>{skillData.totalDuration}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Progress: {completedNodes.length}/{totalLearningNodes} steps
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Flow Visualization */}
        <div className="flex-1 relative">
          <ReactFlow
            colorMode="light"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            panOnDrag={true}
            panOnScroll={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            fitView
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            className="bg-transparent"
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls className="react-flow__controls" />
          </ReactFlow>
        </div>

        {/* Current Step Info and Webcam */}
        {currentNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-96 bg-white/95 backdrop-blur-sm border-l border-gray-200/50 shadow-lg flex flex-col"
            style={{ height: 'calc(100vh - 120px)' }}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-600">Current Step</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{currentNode.data.label}</h3>
              <p className="text-sm text-gray-600 mb-4">{currentNode.data.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <FaClock className="text-xs" />
                <span>{currentNode.data.duration}</span>
              </div>
            </div>

            {/* Video Segments */}
            {currentNode.data.videoSegments && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Video Segments</h4>
                <div className="space-y-2">
                  {currentNode.data.videoSegments.map((segment) => (
                    <div
                      key={segment.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-gray-900">{segment.title}</h5>
                        <span className="text-xs text-gray-500">
                          {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')} - 
                          {Math.floor(segment.endTime / 60)}:{(segment.endTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{segment.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              onClick={() => handleCheckCorrect(currentNode.id)}
              disabled={isChecking}
              className={`relative w-full flex items-center justify-center gap-3 p-4 rounded-xl font-semibold transition-all duration-300 text-white shadow-lg overflow-hidden ${
                checkResult === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200' 
                  : checkResult === 'error'
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow-orange-200'
                  : isChecking
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 cursor-not-allowed shadow-purple-200'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-blue-200'
              }`}
              whileHover={{ scale: isChecking ? 1 : 1.03, y: isChecking ? 0 : -2 }}
              whileTap={{ scale: isChecking ? 1 : 0.97 }}
            >
              {/* Shimmer effect for loading */}
              {isChecking && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              {isChecking ? (
                <>
                  <RunningPersonAnimation />
                  <span className="ml-2 text-sm">AI is analyzing your performance...</span>
                </>
              ) : checkResult === 'success' ? (
                <>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 360, 0]
                    }}
                    transition={{ duration: 0.6, repeat: 2 }}
                  >
                    <FaStar className="text-xl" />
                  </motion.div>
                  <span className="font-bold">Excellent! Moving to next step!</span>
                </>
              ) : checkResult === 'error' ? (
                <>
                  <motion.div
                    animate={{ 
                      rotate: [-15, 15, -15],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.4, repeat: 3 }}
                  >
                    <FaLightbulb className="text-xl" />
                  </motion.div>
                  <span className="font-medium">Let's learn together - Listen to the tips!</span>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaCheck className="text-lg" />
                  </motion.div>
                  <span className="font-semibold">Check if Correct</span>
                  <motion.div
                    className="absolute right-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                </>
              )}
            </motion.button>



            {/* Learning Webcam */}
            <LearningWebcam
              skillId={skillId}
              currentStep={currentNode.id}
              onProgressUpdate={(progress) => {
                console.log('Learning progress:', progress);
              }}
              onAnalysisResult={(result) => {
                console.log('Analysis result:', result);
              }}
            />

            {/* AI Teacher Coach UI - Shows when TTS is speaking or when analyzing */}
            <AnimatePresence>
              {(isSpeaking || isChecking) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 border border-blue-500/30 shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    {/* AI Avatar */}
                    <motion.div
                      className="flex-shrink-0"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        {isChecking && !isSpeaking ? (
                          <FaSearch className="text-white text-xl" />
                        ) : (
                          <FaRobot className="text-white text-xl" />
                        )}
                      </div>
                    </motion.div>

                    {/* Speaking Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          className="flex items-center gap-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full animation-delay-200"></div>
                          <div className="w-2 h-2 bg-white rounded-full animation-delay-400"></div>
                        </motion.div>
                        <span className="text-white/90 text-sm font-medium">
                          {isChecking && !isSpeaking ? 'AI Teacher is analyzing...' : 'AI Teacher is speaking...'}
                        </span>
                      </div>

                      {/* Content based on state */}
                      {isChecking && !isSpeaking ? (
                        /* Analyzing State */
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <FaSearch className="text-white text-sm" />
                            </motion.div>
                            <span className="text-white text-sm">Taking a look at your performance...</span>
                          </div>
                          <p className="text-white/80 text-xs">
                            I'm carefully reviewing your demonstration. Just a moment while I provide personalized feedback!
                          </p>
                        </div>
                      ) : (
                        /* Speaking State */
                        <>
                          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-white text-sm leading-relaxed">
                              {typedText}
                              <motion.span
                                className="inline-block w-0.5 h-4 bg-white ml-1"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            </p>
                          </div>

                          {/* Sound waves animation */}
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-white/60 rounded-full"
                                animate={{
                                  height: [4, 12, 4],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                            <span className="text-white/70 text-xs ml-2 flex items-center gap-1">
                              <FaVolumeUp className="text-xs" />
                              Playing audio feedback
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-4xl border border-gray-200 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedNode.data.label}</h2>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {selectedNode.data.video ? (
                <video
                  src={selectedNode.data.video}
                  controls
                  className="w-full h-full rounded-lg"
                    onPlay={() => {
                      console.log(`▶️ Video started playing:`, selectedNode.data.video);
                      setIsVideoPlaying(true);
                    }}
                    onPause={() => {
                      console.log(`⏸️ Video paused:`, selectedNode.data.video);
                      setIsVideoPlaying(false);
                    }}
                    onError={(e) => {
                      console.error(`❌ Video error:`, {
                        videoSrc: selectedNode.data.video,
                        videoData: selectedNode.data.videoData,
                        error: e.currentTarget.error,
                        networkState: e.currentTarget.networkState,
                        readyState: e.currentTarget.readyState
                      });
                    }}
                    onLoadStart={() => {
                      console.log(`🔄 Video load started:`, {
                        src: selectedNode.data.video,
                        videoData: selectedNode.data.videoData,
                        isSegment: !!selectedNode.data.videoData?.isSegment
                      });
                    }}
                    onCanPlay={() => {
                      console.log(`✅ Video can play:`, selectedNode.data.video);
                    }}
                    onLoadedMetadata={(e) => {
                      console.log(`📊 Video metadata loaded:`, {
                        duration: e.currentTarget.duration,
                        videoWidth: e.currentTarget.videoWidth,
                        videoHeight: e.currentTarget.videoHeight
                      });
                      
                      // If this is a video segment, set the current time to start time
                      if (selectedNode.data.videoData?.startTime !== undefined) {
                        e.currentTarget.currentTime = selectedNode.data.videoData.startTime;
                        console.log(`⏭️ Set video start time to:`, selectedNode.data.videoData.startTime);
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-4xl mb-2">🎥</div>
                    <p>No video available</p>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4">{selectedNode.data.description}</p>

              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
                <h4 className="font-semibold mb-2">Debug Info:</h4>
                <div className="space-y-1">
                  <div><strong>Video URL:</strong> {selectedNode.data.video || 'None'}</div>
                  <div><strong>Has Video:</strong> {selectedNode.data.video ? 'Yes' : 'No'}</div>
                  <div><strong>Is Segment:</strong> {selectedNode.data.videoData?.isSegment ? 'Yes' : 'No'}</div>
                  {selectedNode.data.videoData?.startTime !== undefined && (
                    <div><strong>Start Time:</strong> {selectedNode.data.videoData.startTime}s</div>
                  )}
                  {selectedNode.data.videoData?.endTime !== undefined && (
                    <div><strong>End Time:</strong> {selectedNode.data.videoData.endTime}s</div>
                  )}
                  <div><strong>Node Type:</strong> {selectedNode.data.type || 'Unknown'}</div>
                </div>
              </div>

                            <div className="space-y-2">
              <div className="flex gap-4">
                  {/* Only show Check if Correct button for current node */}
                  {selectedNode.data.status === 'current' && (
                <motion.button
                      onClick={() => handleCheckCorrect(selectedNode.id)}
                      disabled={isChecking}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white ${
                        checkResult === 'success' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : checkResult === 'error'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : isChecking
                          ? 'bg-purple-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      whileHover={{ scale: isChecking ? 1 : 1.02 }}
                      whileTap={{ scale: isChecking ? 1 : 0.98 }}
                    >
                      {isChecking ? (
                        <>
                          <RunningPersonAnimation />
                          <span className="ml-2">AI is analyzing...</span>
                        </>
                      ) : checkResult === 'success' ? (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: 3 }}
                          >
                            <FaStar className="text-lg" />
                          </motion.div>
                          Great job!
                        </>
                      ) : checkResult === 'error' ? (
                        <>
                          <motion.div
                            animate={{ rotate: [-10, 10, -10] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                          >
                            <FaLightbulb className="text-lg" />
                          </motion.div>
                          Listen to the tips!
                        </>
                      ) : (
                        <>
                  <FaCheck className="text-sm" />
                          Check if Correct
                        </>
                      )}
                </motion.button>
                  )}
                <motion.button
                  onClick={() => setSelectedNode(null)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200 text-gray-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
                </div>
                

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {checkResult === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-full p-8 shadow-2xl"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-6xl text-green-500"
              >
                ✅
              </motion.div>
            </motion.div>
            
            {/* Confetti-like particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    scale: 0,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                  }}
                  animate={{ 
                    opacity: 0, 
                    scale: 1,
                    y: window.innerHeight + 100
                  }}
                  transition={{ 
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-4 h-4 bg-green-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Test Button - Bottom Left */}
      {currentNode && (
        <motion.button
          onClick={() => handleTestSuccess(currentNode.id)}
          disabled={isChecking}
          className="fixed bottom-4 left-4 w-10 h-10 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-200 z-50"
          whileHover={{ scale: isChecking ? 1 : 1.1 }}
          whileTap={{ scale: isChecking ? 1 : 0.9 }}
          title="Test Success (Development)"
        >
          🧪
        </motion.button>
      )}
    </div>
  );
}

export default function SkillLearningFlow({ skillId, learningData, userId, learningProgress, isLoadingProgress, refetchProgress, speechMatch }: SkillLearningFlowProps) {
  return (
    <ReactFlowProvider>
      <SkillLearningFlowContent 
        skillId={skillId} 
        learningData={learningData} 
        userId={userId} 
        learningProgress={learningProgress}
        isLoadingProgress={isLoadingProgress}
        refetchProgress={refetchProgress}
        speechMatch={speechMatch}
      />
    </ReactFlowProvider>
  );
} 