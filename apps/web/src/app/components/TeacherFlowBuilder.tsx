"use client"

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  useKeyPress,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import TeacherFlowNode from "./TeacherFlowNode";
import FlowSidebar from "./FlowSidebar";

export type AIModelType = 'vision-language' | 'object-detection' | 'motion-matching';

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
};

export type FlowNodeData = {
  label: string;
  description: string;
  aiModel: AIModelType | null;
  threshold: number;
  isStartNode?: boolean;
  isEndNode?: boolean;
  files: UploadedFile[];
};

const initialNodes: Node<FlowNodeData>[] = [
  {
    id: "start",
    position: { x: 250, y: 50 },
    data: {
      label: "Start",
      description: "Beginning of the learning flow",
      aiModel: null,
      threshold: 0.8,
      isStartNode: true,
      files: [],
    },
    type: "teacherFlowNode",
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

const nodeTypes: NodeTypes = { teacherFlowNode: TeacherFlowNode };

function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    nodeId?: string;
  }>({ x: 0, y: 0, visible: false });
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  // Keyboard shortcuts
  const deletePressed = useKeyPress(['Delete', 'Backspace']);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#9CA3AF',
        },
        style: {
          strokeWidth: 2,
          stroke: '#9CA3AF',
        },
        animated: true,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Update edge styles based on selection
  const styledEdges = edges.map((edge) => {
    const isSelected = selectedEdgeId === edge.id;
    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isSelected ? '#3B82F6' : '#9CA3AF',
        strokeWidth: isSelected ? 3 : 2,
      },
    };
  });

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setSidebarOpen(true);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setSidebarOpen(false);
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu({ x: 0, y: 0, visible: false });
    if (selectedNodeId) {
      setSelectedNodeId(null);
      setSidebarOpen(false);
    }
    if (selectedEdgeId) {
      setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    setContextMenu({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      visible: true,
    });
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    setContextMenu({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      visible: true,
      nodeId: node.id,
    });
  }, []);

  const createNewNode = useCallback((type: 'normal' | 'end') => {
    const position = screenToFlowPosition({
      x: contextMenu.x,
      y: contextMenu.y,
    });

    const newNode: Node<FlowNodeData> = {
      id: `node-${Date.now()}`,
      position,
      data: {
        label: type === 'end' ? 'End' : `Step ${nodes.length}`,
        description: type === 'end' ? 'End of the learning flow' : 'New learning step',
        aiModel: null,
        threshold: 0.8,
        isEndNode: type === 'end',
        files: [],
      },
      type: "teacherFlowNode",
    };

    setNodes((nds) => nds.concat(newNode));
    setContextMenu({ x: 0, y: 0, visible: false });
  }, [contextMenu, nodes.length, screenToFlowPosition, setNodes]);

  const updateNodeData = useCallback((nodeId: string, data: Partial<FlowNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    // Prevent deletion of start node
    const nodeToDelete = nodes.find(node => node.id === nodeId);
    if (nodeToDelete?.data.isStartNode) {
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setSidebarOpen(false);
    }
  }, [nodes, selectedNodeId, setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, setEdges]);

  const deleteSelected = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    } else if (selectedEdgeId) {
      deleteEdge(selectedEdgeId);
    }
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge]);

  const confirmDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteSelected();
    setShowDeleteConfirm(false);
  }, [deleteSelected]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (deletePressed) {
      deleteSelected();
    }
  }, [deletePressed, deleteSelected]);

  return (
    <div className="w-full h-full bg-transparent flex">
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          colorMode="dark"
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          zoomOnScroll
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-transparent"
        >
          <Background color="#0f172a" gap={20} />
          <Controls className="react-flow__controls" />
          
          {/* Floating Toolbar */}
          {(selectedNodeId || selectedEdgeId) && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl px-4 py-2 flex items-center gap-3 z-50 animate-in slide-in-from-top-2 duration-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                {selectedNodeId 
                  ? `Node selected: ${nodes.find(n => n.id === selectedNodeId)?.data.label}`
                  : 'Edge selected'
                }
              </span>
              <div className="w-px h-4 bg-gray-600"></div>
              <span className="text-gray-400 text-xs">Press Delete to remove</span>
              <button
                onClick={confirmDelete}
                className="ml-2 px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          )}
        </ReactFlow>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50 py-2 min-w-48 animate-in fade-in-0 slide-in-from-top-1 duration-200"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            {contextMenu.nodeId ? (
              // Node context menu
              <>
                <button
                  onClick={() => {
                    setSelectedNodeId(contextMenu.nodeId!);
                    setSidebarOpen(true);
                    setContextMenu({ x: 0, y: 0, visible: false });
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Configure Node
                </button>
                <div className="border-t border-gray-700 my-1 mx-2"></div>
                <button
                  onClick={() => {
                    if (contextMenu.nodeId) {
                      setSelectedNodeId(contextMenu.nodeId);
                      setShowDeleteConfirm(true);
                    }
                    setContextMenu({ x: 0, y: 0, visible: false });
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 transition-colors duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={nodes.find(n => n.id === contextMenu.nodeId)?.data.isStartNode}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Delete Node
                </button>
              </>
            ) : (
              // Pane context menu
              <>
                <button
                  onClick={() => createNewNode('normal')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Add Step Node
                </button>
                <button
                  onClick={() => createNewNode('end')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Add End Node
                </button>
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-300">
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Confirm Deletion</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Are you sure you want to delete this {selectedNodeId ? 'node' : 'edge'}? 
                {selectedNodeId && ' All connected edges will also be removed.'}
                <br />
                <span className="text-red-400 font-medium">This action cannot be undone.</span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <FlowSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedNode={selectedNode}
        onUpdateNode={updateNodeData}
      />
    </div>
  );
}

export default function TeacherFlowBuilder() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <FlowBuilder />
      </div>
    </ReactFlowProvider>
  );
} 