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
import VideoUploadModal from "./VideoUploadModal";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

// IndexedDB helper functions (same as in VideoEditor)
const getVideoFileFromIndexedDB = async (id: string): Promise<File | null> => {
  try {
    const request = indexedDB.open('VideoEditorDB', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.file : null);
      };
    });
  } catch (error) {
    console.error('Error getting video from IndexedDB:', error);
    return null;
  }
};

const clearVideoFileFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const request = indexedDB.open('VideoEditorDB', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    
    const transaction = db.transaction(['videos'], 'readwrite');
    const store = transaction.objectStore('videos');
    
    return new Promise((resolve, reject) => {
      const deleteRequest = store.delete(id);
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error clearing video from IndexedDB:', error);
  }
};

export type AIModelType = 'vision-language' | 'object-detection' | 'motion-matching';

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  file?: File; // Keep reference to original File object for uploading
  segmentData?: {
    startTime: number;
    endTime: number;
    color: string;
    isExpired?: boolean;
    originalFileName?: string;
    segmentTitle?: string;
  };
  isExpired?: boolean; // Flag for expired URLs
};

export type FlowNodeData = {
  label: string;
  description: string;
  aiModel: AIModelType | null;
  threshold: number;
  vlmPrompt?: string; // Vision Language Model prompt - only used when aiModel is 'vision-language'
  objectName?: string; // Object name to detect - only used when aiModel is 'object-detection'
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
      vlmPrompt: "",
      objectName: "",

      isStartNode: true,
      files: [],
    },
    type: "teacherFlowNode",
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

const nodeTypes: NodeTypes = { teacherFlowNode: TeacherFlowNode };

interface FlowBuilderProps {
  learningId: string;
}

function FlowBuilder({ learningId }: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [videoUploadPosition, setVideoUploadPosition] = useState({ x: 0, y: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialGraphState, setInitialGraphState] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    nodeId?: string;
  }>({ x: 0, y: 0, visible: false });

  // Load existing graph data
  const { data: graphData, isLoading: isLoadingGraph } = useQuery({
    queryKey: ['learning-graph', learningId],
    queryFn: async () => {
      const response = await api.get(`/learning/${learningId}/graph`);
      return response.data;
    },
  });
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  // Keyboard shortcuts
  const deletePressed = useKeyPress(['Delete', 'Backspace']);

  // Function to compare graph states and detect changes
  const hasGraphChanged = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    if (!initialGraphState) {
      // For new graphs, consider changes if we have more than just start/end nodes
      const nonSystemNodes = currentNodes.filter(node => 
        !node.data.isStartNode && !node.data.isEndNode
      );
      return nonSystemNodes.length > 0 || currentEdges.length > 0;
    }

    // Compare nodes
    if (currentNodes.length !== initialGraphState.nodes.length) return true;
    
    for (let i = 0; i < currentNodes.length; i++) {
      const currentNode = currentNodes[i];
      const initialNode = initialGraphState.nodes.find(n => n.id === currentNode.id);
      
      if (!initialNode) return true;
      
      // Check position changes
      if (currentNode.position.x !== initialNode.position.x || 
          currentNode.position.y !== initialNode.position.y) return true;
      
      // Check data changes (simplified comparison)
      if (JSON.stringify(currentNode.data) !== JSON.stringify(initialNode.data)) return true;
    }

    // Compare edges
    if (currentEdges.length !== initialGraphState.edges.length) return true;
    
    for (let i = 0; i < currentEdges.length; i++) {
      const currentEdge = currentEdges[i];
      const initialEdge = initialGraphState.edges.find(e => e.id === currentEdge.id);
      
      if (!initialEdge) return true;
      
      if (currentEdge.source !== initialEdge.source || 
          currentEdge.target !== initialEdge.target) return true;
    }

    return false;
  }, [initialGraphState]);

  // Load existing graph data from server
  useEffect(() => {
    if (graphData && !isLoaded && !isLoadingGraph) {
      if (graphData.hasGraph && graphData.learning.nodes.length > 0) {
        // Convert server data to ReactFlow format
        const loadedNodes: Node<FlowNodeData>[] = graphData.learning.nodes.map((node: any) => ({
          id: node.id,
          position: { x: node.positionX, y: node.positionY },
          data: {
            label: node.title,
            description: node.description,
            aiModel: (node.type === 'start' || node.type === 'end') ? null : 
                     (node.algorithm === 'basic' || !node.algorithm) ? null : (node.algorithm as AIModelType),
            threshold: (node.type === 'start' || node.type === 'end') ? 0.8 : (node.threshold || 0.8),
            vlmPrompt: (node.type === 'start' || node.type === 'end') ? "" : (node.vlmPrompt || ""),
            objectName: (node.type === 'start' || node.type === 'end') ? "" : (node.objectName || ""),
            isStartNode: node.type === 'start',
            isEndNode: node.type === 'end',
            files: [
              // Add video file if exists (not for Start/End nodes)
              ...((node.video && node.type !== 'start' && node.type !== 'end') ? (() => {
                try {
                  // Try to parse as JSON (for video segments)
                  const videoData = JSON.parse(node.video);
                  if (videoData.isSegment && videoData.url) {
                    // Backend now handles URL expiration automatically by generating fresh signed URLs
                    
                    return [{
                      id: `video-${node.id}`,
                      name: `${videoData.segmentTitle || node.title}.mp4`,
                      size: 0,
                      type: 'video/mp4',
                      url: videoData.url,
                      uploadedAt: new Date(node.createdAt),
                      segmentData: {
                        startTime: videoData.startTime,
                        endTime: videoData.endTime,
                        color: '#3b82f6', // Default color for loaded segments
                        originalFileName: videoData.originalFileName,
                        segmentTitle: videoData.segmentTitle
                      }
                    }];
                  }
                } catch (e) {
                  // Not JSON, treat as regular video URL
                }
                
                // Regular video file - backend now handles URL expiration automatically
                return [{
                  id: `video-${node.id}`,
                  name: `${node.title}.mp4`,
                  size: 0,
                  type: 'video/mp4',
                  url: node.video, // Backend provides fresh signed URLs
                  uploadedAt: new Date(node.createdAt)
                }];
              })() : []),
              // Add materials if exists (not for Start/End nodes)
              ...((node.materials && node.type !== 'start' && node.type !== 'end') ? JSON.parse(node.materials).map((material: any) => ({
                id: material.id,
                name: material.name,
                size: material.size,
                type: material.type,
                url: material.url,
                uploadedAt: new Date(node.createdAt),
              })) : [])
            ],
          },
          type: "teacherFlowNode",
          deletable: node.type !== 'start',
        }));

        const loadedEdges: Edge[] = graphData.learning.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.fromNode,
          target: edge.toNode,
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
        }));

        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setInitialGraphState({ nodes: loadedNodes, edges: loadedEdges });
        setIsLoaded(true);
      } else if (graphData && !graphData.hasGraph && !isLoaded) {
        // For new graphs with no existing data, set initial state to current nodes/edges
        setTimeout(() => {
          setInitialGraphState({ nodes: [...nodes], edges: [...edges] });
          setIsLoaded(true);
        }, 100);
      }
    }
  }, [graphData, isLoaded, isLoadingGraph, setNodes, setEdges, nodes, edges]);

  // Load video segments from localStorage and convert to nodes (only if no existing graph)
  useEffect(() => {
    const loadVideoSegments = async () => {
      try {
        const storedData = localStorage.getItem('videoSegments');
        const pendingLearningId = localStorage.getItem('pendingLearningId');
        
        if (storedData && pendingLearningId === learningId && (!graphData || !graphData.hasGraph)) {
          console.log('📦 Raw localStorage data:', storedData);
          const parsedData = JSON.parse(storedData);
          console.log('📋 Parsed localStorage data:', parsedData);
          
          const { segments, originalVideoFile, timestamp, hasVideoFile } = parsedData;
          
          console.log('Loading video segments from localStorage:', { 
            segmentsCount: segments?.length, 
            originalVideoFile, 
            timestamp, 
            hasVideoFile,
            segments: segments?.slice(0, 2) // Show first 2 segments for debugging
          });
          
          // Check if data is fresh (within 5 minutes)
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          if (now - timestamp > fiveMinutes) {
            console.log('Video segments expired, removing from localStorage');
            localStorage.removeItem('videoSegments');
            // Also clean up IndexedDB
            if (hasVideoFile) {
              await clearVideoFileFromIndexedDB('pendingVideo');
            }
            return;
          }

          // Get the original video file from IndexedDB or localStorage fallback
          let recreatedVideoFile: File | null = null;
          if (hasVideoFile) {
            try {
              console.log('🔍 Attempting to retrieve video file from IndexedDB...');
              recreatedVideoFile = await getVideoFileFromIndexedDB('pendingVideo');
              if (recreatedVideoFile) {
                console.log('✅ Retrieved original video file from IndexedDB:', {
                  name: recreatedVideoFile.name,
                  size: recreatedVideoFile.size,
                  type: recreatedVideoFile.type
                });
              } else {
                console.warn('⚠️ Video file not found in IndexedDB, trying localStorage fallback...');
                
                // Try localStorage fallback
                if (originalVideoFile && originalVideoFile.dataUrl) {
                  console.log('🔄 Attempting to recreate video file from localStorage dataUrl...');
                  try {
                    const response = await fetch(originalVideoFile.dataUrl);
                    const blob = await response.blob();
                    recreatedVideoFile = new File([blob], originalVideoFile.name, {
                      type: originalVideoFile.type,
                      lastModified: Date.now()
                    });
                    console.log('✅ Recreated video file from localStorage dataUrl');
                  } catch (dataUrlError) {
                    console.error('❌ Failed to recreate video file from dataUrl:', dataUrlError);
                  }
                } else {
                  console.log('🔍 Checking IndexedDB contents...');
                  // Try to debug IndexedDB contents
                  try {
                    const db = await new Promise<IDBDatabase>((resolve, reject) => {
                      const request = indexedDB.open('VideoEditorDB', 1);
                      request.onerror = () => reject(request.error);
                      request.onsuccess = () => resolve(request.result);
                    });
                    const transaction = db.transaction(['videos'], 'readonly');
                    const store = transaction.objectStore('videos');
                    const getAllRequest = store.getAll();
                    getAllRequest.onsuccess = () => {
                      console.log('📋 IndexedDB contents:', getAllRequest.result);
                    };
                  } catch (dbError) {
                    console.error('Error checking IndexedDB:', dbError);
                  }
                }
              }
            } catch (error) {
              console.error('Failed to retrieve video file from IndexedDB:', error);
              
              // Try localStorage fallback on error
              if (originalVideoFile && originalVideoFile.dataUrl) {
                console.log('🔄 IndexedDB failed, trying localStorage fallback...');
                try {
                  const response = await fetch(originalVideoFile.dataUrl);
                  const blob = await response.blob();
                  recreatedVideoFile = new File([blob], originalVideoFile.name, {
                    type: originalVideoFile.type,
                    lastModified: Date.now()
                  });
                  console.log('✅ Fallback: Recreated video file from localStorage dataUrl');
                } catch (dataUrlError) {
                  console.error('❌ Fallback also failed:', dataUrlError);
                }
              }
            }
          } else {
            console.log('ℹ️ No video file flag set, skipping video file retrieval');
          }
          
          // If we still don't have a video file, let's try to check if segments have any fallback data
          if (!recreatedVideoFile) {
            console.log('🔍 No video file available, checking if segments have fallback data...');
            console.log('📋 First segment data:', segments?.[0]);
          }

          // Convert segments to nodes with individual file objects
          const newNodes = segments.map((segment: {
            id: string;
            title: string;
            description: string;
            startTime: number;
            endTime: number;
            color: string;
            fileName: string;
            fileSize: number;
            fileType: string;
          }, index: number) => {
            const nodeId = `video-segment-${segment.id}`;
            
            // Find the Start node position to place video segments around it
            const startNode = nodes.find(node => node.data.isStartNode);
            const startX = startNode ? startNode.position.x : 100;
            const startY = startNode ? startNode.position.y : 100;
            
            // Generate random position around the Start node
            const angle = (index / segments.length) * 2 * Math.PI; // Distribute evenly in a circle
            const radius = 200 + Math.random() * 100; // Random radius between 200-300px
            const randomOffset = {
              x: Math.random() * 100 - 50, // Random offset ±50px
              y: Math.random() * 100 - 50
            };
            
            const position = {
              x: startX + Math.cos(angle) * radius + randomOffset.x,
              y: startY + Math.sin(angle) * radius + randomOffset.y
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
                files: recreatedVideoFile ? (() => {
                  console.log(`🎬 Creating segment file for: ${segment.title}`, {
                    segmentFileName: segment.fileName,
                    originalVideoName: recreatedVideoFile.name,
                    startTime: segment.startTime,
                    endTime: segment.endTime
                  });
                  
                  // Create a new File object for this specific segment
                  const segmentFile = new File([recreatedVideoFile], segment.fileName, {
                    type: segment.fileType,
                    lastModified: Date.now()
                  });
                  
                  // Add segment metadata to the file
                  (segmentFile as any).segmentData = {
                    startTime: segment.startTime,
                    endTime: segment.endTime,
                    color: segment.color,
                    originalFileName: recreatedVideoFile.name
                  };
                  
                  const blobUrl = URL.createObjectURL(segmentFile);
                  console.log(`✅ Created blob URL for segment: ${blobUrl}`);
                  
                  return [{
                  id: `video-${segment.id}`,
                    name: segment.fileName,
                    size: segment.fileSize,
                    type: segment.fileType,
                    url: blobUrl,
                  uploadedAt: new Date(),
                    file: segmentFile, // Store the actual File object
                  segmentData: {
                    startTime: segment.startTime,
                    endTime: segment.endTime,
                    color: segment.color
                  }
                  }];
                })() : (() => {
                  console.warn(`⚠️ No recreated video file available for segment: ${segment.title}`);
                  return [];
                })(),
              },
              type: "teacherFlowNode",
            };
          });

          // Add new nodes to existing nodes
          setNodes((prevNodes) => {
            const updatedNodes = [...prevNodes, ...newNodes];
            return updatedNodes;
          });

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

          setEdges((prevEdges) => {
            const updatedEdges = [...prevEdges, ...newEdges];
            // Set initial state after all nodes and edges are loaded
            setTimeout(() => {
              setNodes((currentNodes) => {
                setInitialGraphState({ 
                  nodes: currentNodes, 
                  edges: updatedEdges 
                });
                return currentNodes;
              });
            }, 100);
            return updatedEdges;
          });

          // Clean up localStorage and IndexedDB
          localStorage.removeItem('videoSegments');
          localStorage.removeItem('pendingLearningId');
          if (hasVideoFile) {
            await clearVideoFileFromIndexedDB('pendingVideo');
          }
        }
      } catch (error) {
        console.error('Error loading video segments:', error);
        localStorage.removeItem('videoSegments');
        localStorage.removeItem('pendingLearningId');
        // Clean up IndexedDB as well
        try {
          await clearVideoFileFromIndexedDB('pendingVideo');
        } catch (cleanupError) {
          console.error('Error cleaning up IndexedDB:', cleanupError);
        }
      }
    };

    loadVideoSegments();
  }, [learningId, graphData]);

  // Track changes and update hasUnsavedChanges
  useEffect(() => {
    if (initialGraphState && isLoaded) {
      const changed = hasGraphChanged(nodes, edges);
      setHasUnsavedChanges(changed);
    }
  }, [nodes, edges, hasGraphChanged, initialGraphState, isLoaded]);

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

    if (type === 'end') {
      // End nodes don't need video, create directly
    const newNode: Node<FlowNodeData> = {
      id: `node-${Date.now()}`,
      position,
      data: {
          label: 'End',
          description: 'End of the learning flow',
        aiModel: null,
        threshold: 0.8,
        vlmPrompt: "",
        objectName: "",
  
          isEndNode: true,
        files: [],
      },
      type: "teacherFlowNode",
    };

    setNodes((nds) => nds.concat(newNode));
    setContextMenu({ x: 0, y: 0, visible: false });
    } else {
      // Normal nodes require video upload first
      setVideoUploadPosition(position);
      setShowVideoUpload(true);
      setContextMenu({ x: 0, y: 0, visible: false });
    }
  }, [contextMenu, screenToFlowPosition, setNodes]);

  const handleVideoUploaded = useCallback((videoFile: File, title: string, description: string) => {
    const newNode: Node<FlowNodeData> = {
      id: `node-${Date.now()}`,
      position: videoUploadPosition,
      data: {
        label: title,
        description: description || 'New learning step',
        aiModel: null,
        threshold: 0.8,
        vlmPrompt: "",
        objectName: "",
  
        isEndNode: false,
        files: [{
          id: `video-${Date.now()}`,
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          url: URL.createObjectURL(videoFile),
          uploadedAt: new Date(),
          file: videoFile,
        }],
      },
      type: "teacherFlowNode",
    };

    setNodes((nds) => nds.concat(newNode));
    setShowVideoUpload(false);
  }, [videoUploadPosition, setNodes]);

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

  // Helper function to convert URL to File object
  const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  };

  // Save function to call the save-learning-graph API
  const handleSave = useCallback(async () => {
    if (!learningId) {
      setSaveError('Learning ID is required');
      return;
    }

    if (nodes.length === 0) {
      setSaveError('Cannot save empty graph. Please add at least one node.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Prepare nodes data and collect files
      const nodeDataToSave = [];

      for (const node of nodes) {
        // Find video file
      const videoFile = node.data.files.find(file => file.type.includes('video'));
        const materialsFiles = node.data.files.filter(file => !file.type.includes('video'));
        const nodeType = node.data.isStartNode ? 'start' : node.data.isEndNode ? 'end' : 'step';

        const nodeData: any = {
          id: node.id, // Use current node ID as temporary ID for API
        title: node.data.label,
        description: node.data.description,
        positionX: node.position.x,
        positionY: node.position.y,
          type: nodeType,
        };

        // Only add algorithm and threshold for step nodes
        if (nodeType === 'step') {
          nodeData.algorithm = node.data.aiModel || 'basic';
          nodeData.threshold = node.data.threshold || 0.8;
          // Add model-specific fields based on AI model type
          if (node.data.aiModel === 'vision-language' && node.data.vlmPrompt) {
            nodeData.vlmPrompt = node.data.vlmPrompt;
          }
          if (node.data.aiModel === 'object-detection' && node.data.objectName) {
            nodeData.objectName = node.data.objectName;
          }
        }

        // Only add file field names for step nodes
        if (nodeType === 'step') {
          // Always set field names for step nodes, even if no file is currently available
          // This helps with backend validation and file management
          nodeData.videoFieldName = `${node.id}_video`;
          if (materialsFiles.length > 0) {
            nodeData.materialsFieldName = `${node.id}_materials`;
          }
          
          // Add video segment data if this node has a video segment
          if (videoFile && videoFile.segmentData) {
            nodeData.videoStartTime = videoFile.segmentData.startTime;
            nodeData.videoEndTime = videoFile.segmentData.endTime;
            // Add original filename if available
            if ((videoFile.file as any)?.segmentData?.originalFileName) {
              nodeData.originalFileName = (videoFile.file as any).segmentData.originalFileName;
            }
          }
        }

        nodeDataToSave.push(nodeData);

        // Add File objects directly to FormData (skip for Start/End nodes)
        if (nodeType !== 'start' && nodeType !== 'end') {
          // Only upload video file if it's a new File object or blob URL (not existing server URLs)
          if (videoFile && videoFile.file) {
            // New file upload
            formData.append(`${node.id}_video`, videoFile.file);
            console.log(`Adding new video file for node ${node.id}`);
          } else if (videoFile && videoFile.url && videoFile.url.startsWith('blob:')) {
            // Convert blob URL to file (from video editor)
            try {
              const file = await urlToFile(videoFile.url, videoFile.name, videoFile.type);
              formData.append(`${node.id}_video`, file);
              console.log(`Converting blob URL to file for node ${node.id}`);
            } catch (error) {
              console.error(`Error converting video file for node ${node.id}:`, error);
            }
          } else if (videoFile && videoFile.url && !videoFile.url.startsWith('blob:')) {
            // Existing server URL - don't upload, backend will preserve it
            console.log(`Skipping existing video file for node ${node.id} (server URL)`);
          }

          if (materialsFiles.length > 0) {
            // For now, take the first materials file. You can modify this to handle multiple files
            const materialsFile = materialsFiles[0];
            if (materialsFile.file) {
              // New file upload
              formData.append(`${node.id}_materials`, materialsFile.file);
              console.log(`Adding new materials file for node ${node.id}`);
            } else if (materialsFile.url && materialsFile.url.startsWith('blob:')) {
              // Convert blob URL to file
              try {
                const file = await urlToFile(materialsFile.url, materialsFile.name, materialsFile.type);
                formData.append(`${node.id}_materials`, file);
                console.log(`Converting blob URL to materials file for node ${node.id}`);
              } catch (error) {
                console.error(`Error converting materials file for node ${node.id}:`, error);
              }
            } else if (materialsFile.url && !materialsFile.url.startsWith('blob:')) {
              // Existing server URL - don't upload, backend will preserve it
              console.log(`Skipping existing materials file for node ${node.id} (server URL)`);
            }
          }
        }
      }

      // Prepare edges data
    const edgeDataToSave = edges.map((edge) => ({
      fromNode: edge.source,
      toNode: edge.target
    }));

      // Prepare the complete graph data
      const graphData = {
        learningId: learningId,
      nodes: nodeDataToSave,
      edges: edgeDataToSave
    };

      // Add JSON data to FormData
      formData.append('saveLearningGraphDto', JSON.stringify(graphData));

      console.log('Saving graph data:', JSON.stringify(graphData, null, 2));
      console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name}` : value]));
      
      // Validate step nodes have required video files (either uploaded now or already exist)
      const stepNodes = nodes.filter(node => !node.data.isStartNode && !node.data.isEndNode);
      const missingVideoNodes = stepNodes.filter(node => {
        const hasVideoFile = node.data.files.some(file => {
          return file.type.includes('video') && (
            file.file || // Has File object
            file.url.startsWith('blob:') || // Has blob URL (from video editor)
            (!file.url.startsWith('blob:') && !file.file) // Has server URL (existing file)
          );
        });
        return !hasVideoFile;
      });
      
      if (missingVideoNodes.length > 0) {
        throw new Error(`Missing video files for nodes: ${missingVideoNodes.map(n => n.data.label).join(', ')}. Please upload videos for all learning steps.`);
      }

      // Make API call
      const response = await api.post('/learning/save-learning-graph', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Save successful:', response.data);
      setSaveSuccess(true);
      toast.success('Learning graph saved successfully!✨');
      
      // Reset change tracking after successful save
      setInitialGraphState({ nodes: [...nodes], edges: [...edges] });
      setHasUnsavedChanges(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

    } 
    catch (error: any) {
      console.error('Save failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to save learning graph';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      toast.error('Failed to save learning graph. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, learningId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (deletePressed) {
      deleteSelected();
    }
  }, [deletePressed, deleteSelected]);

  // Show loading state while fetching graph data
  if (isLoadingGraph) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning graph...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Save Button - Only show when there are unsaved changes */}
          {hasUnsavedChanges && (
            <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
              {/* Unsaved changes indicator */}
              <div className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Unsaved changes
              </div>
            <button
              onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium animate-in slide-in-from-right-2 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : saveSuccess
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </>
              ) : (
                <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save Flow
                </>
              )}
            </button>
            
            {/* Error Message */}
            {saveError && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs animate-in slide-in-from-right-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{saveError}</span>
          </div>
                <button
                  onClick={() => setSaveError(null)}
                  className="absolute top-1 right-1 text-white hover:text-gray-200"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
            </button>
          </div>
            )}
            </div>
          )}
          
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

        {/* Video Upload Modal */}
        <VideoUploadModal
          isOpen={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          onVideoUploaded={handleVideoUploaded}
          position={videoUploadPosition}
        />

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

interface TeacherFlowBuilderProps {
  learningId: string;
}

export default function TeacherFlowBuilder({ learningId }: TeacherFlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <FlowBuilder learningId={learningId} />
      </div>
    </ReactFlowProvider>
  );
} 