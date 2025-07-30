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

  // Load video segments from localStorage and convert to nodes
  useEffect(() => {
    const loadVideoSegments = () => {
      try {
        const storedData = localStorage.getItem('videoSegments');
        if (storedData) {
          const { segments, videoFile, timestamp } = JSON.parse(storedData);
          
          // Check if data is fresh (within 5 minutes)
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          if (now - timestamp > fiveMinutes) {
            localStorage.removeItem('videoSegments');
            return;
          }

          // Convert segments to nodes
          const newNodes = segments.map((segment: {
            id: string;
            title: string;
            description: string;
            startTime: number;
            endTime: number;
            color: string;
          }, index: number) => {
            const nodeId = `video-segment-${segment.id}`;
            const position = {
              x: 250 + (index * 300), // Spread horizontally
              y: 200 + (index % 2 * 150) // Alternate vertically
            };

            return {
              id: nodeId,
              position,
              data: {
                label: segment.title,
                description: segment.description || `Video segment from ${formatTime(segment.startTime)} to ${formatTime(segment.endTime)}`,
                aiModel: null,
                threshold: 0.8,
                isStartNode: false,
                isEndNode: false,
                files: videoFile ? [{
                  id: `video-${segment.id}`,
                  name: videoFile.name,
                  size: videoFile.size,
                  type: videoFile.type,
                  url: videoFile.url,
                  uploadedAt: new Date(),
                  segmentData: {
                    startTime: segment.startTime,
                    endTime: segment.endTime,
                    color: segment.color
                  }
                }] : [],
              },
              type: "teacherFlowNode",
            };
          });

          // Add new nodes to existing nodes
          setNodes((prevNodes) => [...prevNodes, ...newNodes]);

          // Create edges to connect nodes sequentially
          const newEdges = newNodes.map((node: Node<FlowNodeData>, index: number) => {
            if (index === 0) {
              // Connect first segment node to start node
              return {
                id: `start-to-${node.id}`,
                source: 'start',
                target: node.id,
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
            } else {
              // Connect to previous segment node
              return {
                id: `${newNodes[index - 1].id}-to-${node.id}`,
                source: newNodes[index - 1].id,
                target: node.id,
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
            }
          }).filter(Boolean);

          setEdges((prevEdges) => [...prevEdges, ...newEdges]);

          // Clean up localStorage
          localStorage.removeItem('videoSegments');
        }
      } catch (error) {
        console.error('Error loading video segments:', error);
        localStorage.removeItem('videoSegments');
      }
    };

    loadVideoSegments();
  }, []);

  // Helper function to format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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

  // Save function to extract and log node and edge data
  const handleSave = useCallback(() => {
    const nodeDataToSave = nodes.map((node) => {
      // Extract video URL from files if available
      const videoFile = node.data.files.find(file => file.type.includes('video'));
      const videoUrl = videoFile?.url || '';
      
      // Extract materials (non-video files) as JSON string
      const materials = node.data.files
        .filter(file => !file.type.includes('video'))
        .map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          size: file.size
        }));

      return {
        title: node.data.label,
        description: node.data.description,
        video: videoUrl,
        materials: JSON.stringify(materials),
        positionX: node.position.x,
        positionY: node.position.y,
        learningId: "LEARNING_ID_PLACEHOLDER", // You'll need to replace this with actual learningId
        algorithm: node.data.aiModel || 'none',
        type: node.data.isStartNode ? 'start' : node.data.isEndNode ? 'end' : 'step',
        threshold: node.data.threshold
      };
    });

    const edgeDataToSave = edges.map((edge) => ({
      learningId: "LEARNING_ID_PLACEHOLDER", // You'll need to replace this with actual learningId
      fromNode: edge.source,
      toNode: edge.target
    }));

    console.log('Nodes data to save:', nodeDataToSave);
    console.log('Edges data to save:', edgeDataToSave);
    
    // You can replace these console.logs with your API calls
    // Example: 
    // await saveNodesToDatabase(nodeDataToSave);
    // await saveEdgesToDatabase(edgeDataToSave);
    
    return {
      nodes: nodeDataToSave,
      edges: edgeDataToSave
    };
  }, [nodes, edges]);

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
          colorMode="light"
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
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          panOnDrag={true}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-transparent"
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls className="react-flow__controls" />
          
          {/* Save Button */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium animate-in slide-in-from-right-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save Flow
            </button>
          </div>
          
          {/* Floating Toolbar */}
          {(selectedNodeId || selectedEdgeId) && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl px-4 py-2 flex items-center gap-3 z-50 animate-in slide-in-from-top-2 duration-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-800 text-sm font-medium">
                {selectedNodeId 
                  ? `Node selected: ${nodes.find(n => n.id === selectedNodeId)?.data.label}`
                  : 'Edge selected'
                }
              </span>
              <div className="w-px h-4 bg-gray-600"></div>
              <span className="text-gray-600 text-xs">Press Delete to remove</span>
              <button
                onClick={confirmDelete}
                className="ml-2 px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          )}
        </ReactFlow>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50 py-2 min-w-48 animate-in fade-in-0 slide-in-from-top-1 duration-200"
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
                  className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Configure Node
                </button>
                <div className="border-t border-gray-200 my-1 mx-2"></div>
                <button
                  onClick={() => {
                    if (contextMenu.nodeId) {
                      setSelectedNodeId(contextMenu.nodeId);
                      setShowDeleteConfirm(true);
                    }
                    setContextMenu({ x: 0, y: 0, visible: false });
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Add Step Node
                </button>
                <button
                  onClick={() => createNewNode('end')}
                  className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-300">
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete this {selectedNodeId ? 'node' : 'edge'}? 
                {selectedNodeId && ' All connected edges will also be removed.'}
                <br />
                <span className="text-red-400 font-medium">This action cannot be undone.</span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
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