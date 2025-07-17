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
      label: "Step 1: Circuit Basics",
      description: "Learn about basic electronic components: resistors, LEDs, and batteries",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "done"
    },
    type: "skillNode",
  },
  {
    id: "2",
    position: { x: 0, y: 500 },
    data: {
      label: "Step 2: First LED Circuit",
      description: "Build your first simple LED circuit with a battery and resistor",
      video: "https://www.w3schools.com/html/movie.mp4",
      status: "done"
    },
    type: "skillNode",
  },
  {
    id: "3",
    position: { x: 0, y: 1000 },
    data: {
      label: "Step 3: Series & Parallel",
      description: "Experiment with series and parallel LED configurations",
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      status: "current"
    },
    type: "skillNode",
  },
  {
    id: "4",
    position: { x: 0, y: 1500 },
    data: {
      label: "Step 4: Switch Control",
      description: "Add switches to control your LED circuits interactively",
      video: "https://www.w3schools.com/html/movie.mp4",
        status: "not-done"
    },
    type: "skillNode",
  },
  {
    id: "5",
    position: { x: 0, y: 2000 },
    data: {
      label: "Step 5: Final Project",
      description: "Create a multi-LED display with different patterns and controls",
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
            colorMode="light"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color="#e2e8f0" gap={50} />
          <Controls className="custom-controls" />
        </ReactFlow>
      </div>
    </div>
  );
}
