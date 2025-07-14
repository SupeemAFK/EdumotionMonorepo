"use client"

import React from "react";
import {
    ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import SkillNode from "./SkillNode";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: "Step 1: Introduction",
      description: "Welcome! Watch this intro to get started.",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "done"
    },
    type: "skillNode",
  },
  {
    id: "2",
    position: { x: 0, y: 500 },
    data: {
      label: "Step 2: Learn Basics",
      description: "Learn the basics in this step.",
      video: "https://www.w3schools.com/html/movie.mp4",
      status: "done"
    },
    type: "skillNode",
  },
  {
    id: "3",
    position: { x: 0, y: 1000 },
    data: {
      label: "Step 3: Practice",
      description: "Practice what you learned.",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "current"
    },
    type: "skillNode",
  },
  {
    id: "4",
    position: { x: 0, y: 1500 },
    data: {
      label: "Step 4: Mastery",
      description: "Master the skill and complete the course!",
      video: "https://www.w3schools.com/html/movie.mp4",
        status: "not-done"
    },
    type: "skillNode",
  },
  {
    id: "5",
    position: { x: 0, y: 2000 },
    data: {
      label: "Step 5: Mastery",
      description: "Master the skill and complete the course!",
      video: "https://www.w3schools.com/html/movie.mp4",
    status: "not-done"
    },
    type: "skillNode",
  }
];

const initialEdges: Edge[] = [
    { 
        id: "e1-2", 
        type: "smoothstep",
        source: "1", 
        target: "2", 
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
        },
        animated: true 
    },
    { 
        id: "e2-3", 
        type: "smoothstep",
        source: "2", 
        target: "3", 
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
        }, 
        animated: true 
    },
    { 
        id: "e3-4", 
        type: "smoothstep",
        source: "3", 
        target: "4", 
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: 'oklch(66.7% 0.295 322.15)',
        }, 
        style: {
            strokeWidth: 2,
            stroke: 'oklch(66.7% 0.295 322.15)',
        }, 
        animated: true 
    },
    { id: 
        "e4-5", 
        type: "smoothstep",
        source: "4", 
        target: "5", 
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
        },
        animated: true 
    },
];

const nodeTypes = { skillNode: SkillNode };

export default function SkillPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-screen h-screen">
        <ReactFlow
            colorMode="dark"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            panOnScroll
            zoomOnScroll
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color="#ffffff" gap={50} />
          <Controls className="custom-controls" />
        </ReactFlow>
      </div>
    </div>
  );
}
