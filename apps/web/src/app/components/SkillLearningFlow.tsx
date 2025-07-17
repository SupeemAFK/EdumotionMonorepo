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
}

interface SkillNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  video: string;
  status: 'completed' | 'current' | 'locked' | 'available';
  duration: string;
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
      title: "JavaScript Fundamentals",
      description: "Learn the basics of JavaScript programming language",
      creator: "John Doe",
      totalDuration: "2h 30m",
      nodes: [
        {
          id: "1",
          position: { x: 0, y: 0 },
          data: {
            label: "Introduction to JavaScript",
            description: "Welcome! Learn what JavaScript is and why it's important.",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "completed",
            duration: "15 min",
            videoSegments: [
              {
                id: "seg1",
                title: "What is JavaScript?",
                startTime: 0,
                endTime: 300,
                description: "Overview of JavaScript and its uses"
              },
              {
                id: "seg2",
                title: "Setting up development environment",
                startTime: 300,
                endTime: 600,
                description: "How to set up your coding environment"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "2",
          position: { x: 0, y: 400 },
          data: {
            label: "Variables and Data Types",
            description: "Learn about variables, strings, numbers, and booleans.",
            video: "https://www.w3schools.com/html/movie.mp4",
            status: "completed",
            duration: "25 min",
            videoSegments: [
              {
                id: "seg3",
                title: "Declaring Variables",
                startTime: 0,
                endTime: 400,
                description: "How to declare and use variables"
              },
              {
                id: "seg4",
                title: "Data Types",
                startTime: 400,
                endTime: 800,
                description: "Understanding different data types"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "3",
          position: { x: 0, y: 800 },
          data: {
            label: "Functions and Scope",
            description: "Understanding functions and variable scope.",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            status: "current",
            duration: "30 min",
            videoSegments: [
              {
                id: "seg5",
                title: "Function Declaration",
                startTime: 0,
                endTime: 500,
                description: "How to declare and call functions"
              },
              {
                id: "seg6",
                title: "Function Parameters",
                startTime: 500,
                endTime: 1000,
                description: "Working with function parameters"
              },
              {
                id: "seg7",
                title: "Variable Scope",
                startTime: 1000,
                endTime: 1500,
                description: "Understanding global and local scope"
              }
            ]
          },
          type: "skillLearningNode",
        },
        {
          id: "4",
          position: { x: 0, y: 1200 },
          data: {
            label: "Control Structures",
            description: "Learn about if statements, loops, and conditionals.",
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
            label: "Objects and Arrays",
            description: "Working with complex data structures.",
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
            label: "DOM Manipulation",
            description: "Learn to interact with web pages using JavaScript.",
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
    }
  };

  return skillsData[skillId] || skillsData["1"];
};

const nodeTypes = { skillLearningNode: SkillLearningNode };

function SkillLearningFlowContent({ skillId }: SkillLearningFlowProps) {
  const router = useRouter();
  const skillData = getSkillData(skillId);
  const [nodes, setNodes, onNodesChange] = useNodesState(skillData.nodes);
  const [edges, , onEdgesChange] = useEdgesState(skillData.edges);
  const [selectedNode, setSelectedNode] = useState<Node<SkillNodeData> | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const typedNode = node as Node<SkillNodeData>;
    if (typedNode.data.status === 'locked') return;
    setSelectedNode(typedNode);
  }, []);

  const handleNodeComplete = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, status: 'completed' as const } };
        }
        // Unlock next node
        const nodeIndex = nds.findIndex(n => n.id === nodeId);
        if (nodeIndex < nds.length - 1) {
          const nextNode = nds[nodeIndex + 1];
          if (nextNode.data.status === 'available') {
            return nextNode.id === nds[nodeIndex + 1].id 
              ? { ...nextNode, data: { ...nextNode.data, status: 'current' as const } }
              : node;
          }
        }
        return node;
      })
    );
    setSelectedNode(null);
  }, [setNodes]);

  const handleBack = () => {
    router.push('/');
  };

  const currentNode = nodes.find(node => (node.data as SkillNodeData).status === 'current') as Node<SkillNodeData> | undefined;
  const completedNodes = nodes.filter(node => (node.data as SkillNodeData).status === 'completed');
  const progress = (completedNodes.length / nodes.length) * 100;

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
              Progress: {completedNodes.length}/{nodes.length} steps
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
              onClick={() => handleNodeComplete(currentNode.id)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-200 text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaCheck className="text-sm" />
              Mark as Complete
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
                <video
                  src={selectedNode.data.video}
                  controls
                  className="w-full h-full rounded-lg"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              </div>

              <p className="text-gray-600 mb-4">{selectedNode.data.description}</p>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => handleNodeComplete(selectedNode.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors duration-200 text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCheck className="text-sm" />
                  Complete Step
                </motion.button>
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

export default function SkillLearningFlow({ skillId }: SkillLearningFlowProps) {
  return (
    <ReactFlowProvider>
      <SkillLearningFlowContent skillId={skillId} />
    </ReactFlowProvider>
  );
} 