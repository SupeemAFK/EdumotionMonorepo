"use client"

import React, { useState, useCallback } from "react";
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
import { FaPlay, FaPause, FaCheck, FaLock, FaArrowLeft, FaBookOpen, FaClock, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import SkillLearningNode from "./SkillLearningNode";
import LearningWebcam from "./LearningWebcam";

interface SkillLearningFlowProps {
  skillId: string;
  learningData?: any;
}

interface SkillNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  video: string;
  status: 'completed' | 'current' | 'locked' | 'available';
  duration: string;
  type?: string;
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

function SkillLearningFlowContent({ skillId, learningData }: SkillLearningFlowProps) {
  const router = useRouter();
  
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

    // Find the first learning node (should be current)
    const firstLearningNode = learningNodes[0];
    
    // Convert nodes to the expected format
    const convertedNodes = sortedNodes.map((node: any, index: number) => {
      let status: 'completed' | 'current' | 'locked' | 'available' = 'locked';
      
      if (node.type === 'start' || node.type === 'end') {
        // Start and end nodes are not interactive
        status = 'locked';
      } else if (node.id === firstLearningNode?.id) {
        // First learning node is current
        status = 'current';
      } else {
        // For now, make other learning nodes available (you can implement more complex logic later)
        const nodeIndex = learningNodes.findIndex((n: any) => n.id === node.id);
        status = nodeIndex <= 1 ? 'available' : 'locked';
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

    return {
      title: learning.title,
      description: learning.description,
      creator: learning.creator?.name || "Unknown",
      totalDuration: "2h 30m", // Could be calculated from nodes
      nodes: convertedNodes,
      edges: convertedEdges,
    };
  };

  const skillData = learningData ? convertApiDataToSkillData(learningData) : getSkillData(skillId);
  const [nodes, setNodes, onNodesChange] = useNodesState(skillData.nodes);
  const [edges, , onEdgesChange] = useEdgesState(skillData.edges);
  const [selectedNode, setSelectedNode] = useState<Node<SkillNodeData> | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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

  const handleCheckCorrect = useCallback((nodeId: string) => {
    console.log('🔍 Check if correct clicked for node:', nodeId);
    // Add your check logic here
  }, []);

  const handleBack = () => {
    router.push('/');
  };

  const currentNode = nodes.find(node => (node.data as SkillNodeData).status === 'current') as Node<SkillNodeData> | undefined;
  // Remove completion tracking since we don't have completion logic anymore
  const totalLearningNodes = nodes.filter(node => (node.data as SkillNodeData).type !== 'start' && (node.data as SkillNodeData).type !== 'end').length;
  const progress = 0; // Set to 0 since we're not tracking completion

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
              Learning: {totalLearningNodes} steps
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
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
            className="w-96 bg-white/95 backdrop-blur-sm border-l border-gray-200/50 p-4 overflow-y-auto space-y-6 shadow-lg"
          >
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
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200 text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaCheck className="text-sm" />
              Check if Correct
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

              <div className="flex gap-4">
                {/* Only show Check if Correct button for current node */}
                {selectedNode.data.status === 'current' && (
                  <motion.button
                    onClick={() => handleCheckCorrect(selectedNode.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200 text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCheck className="text-sm" />
                    Check if Correct
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SkillLearningFlow({ skillId, learningData }: SkillLearningFlowProps) {
  return (
    <ReactFlowProvider>
      <SkillLearningFlowContent skillId={skillId} learningData={learningData} />
    </ReactFlowProvider>
  );
} 