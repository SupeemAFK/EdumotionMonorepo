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
    <div className="w-screen h-screen bg-gray-900 flex">
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
          className="bg-gray-900"
        >
          <Background color="#374151" gap={20} />
          <Controls className="react-flow__controls" />
          
          {/* Floating Toolbar */}
          {(selectedNodeId || selectedEdgeId) && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 z-50">
              <span className="text-white text-sm">
                {selectedNodeId 
                  ? `Node selected: ${nodes.find(n => n.id === selectedNodeId)?.data.label}`
                  : 'Edge selected'
                }
              </span>
              <div className="w-px h-4 bg-gray-600"></div>
              <span className="text-gray-400 text-xs">Press Delete to remove</span>
              <button
                onClick={confirmDelete}
                className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </ReactFlow>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 py-2 min-w-48"
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
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                >
                  Configure Node
                </button>
                <div className="border-t border-gray-600 my-1"></div>
                <button
                  onClick={() => {
                    if (contextMenu.nodeId) {
                      setSelectedNodeId(contextMenu.nodeId);
                      setShowDeleteConfirm(true);
                    }
                    setContextMenu({ x: 0, y: 0, visible: false });
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors"
                  disabled={nodes.find(n => n.id === contextMenu.nodeId)?.data.isStartNode}
                >
                  Delete Node
                </button>
              </>
            ) : (
              // Pane context menu
              <>
                <button
                  onClick={() => createNewNode('normal')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                >
                  Add Step Node
                </button>
                <button
                  onClick={() => createNewNode('end')}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                >
                  Add End Node
                </button>
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this {selectedNodeId ? 'node' : 'edge'}? 
                {selectedNodeId && ' All connected edges will also be removed.'}
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      <div className="w-screen h-screen">
        <FlowBuilder />
      </div>
    </ReactFlowProvider>
  );
} 