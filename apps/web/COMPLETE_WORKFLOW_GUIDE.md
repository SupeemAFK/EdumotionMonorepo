# Complete Learning Graph Workflow Guide

## Overview
The complete workflow now supports intelligent graph creation with video-first node creation, existing graph loading, and seamless integration between video editor and manual creation.

## 🔄 Complete User Flow

### 1. **My Courses Page → View Course**
```
User clicks "View" → /teacher/[id]/graph → Decision Logic
```

### 2. **Decision Logic (GraphPage)**
```
Check if nodes exist for learning:
├── Has Graph → Redirect to /teacher/[id] (Load existing)
└── No Graph → Show Creation Choices
    ├── "Create with Video Editor" → /video-editor
    └── "Create on Your Own" → /teacher/[id]
```

### 3. **Video Editor Path**
```
Video Editor → Create Segments → Store in localStorage → 
Redirect to /teacher/[id] → Auto-load segments as nodes
```

### 4. **Manual Creation Path**
```
Direct to /teacher/[id] → Empty graph → 
Right-click → Upload video first → Create node
```

## 🎯 Key Features Implemented

### ✅ **Intelligent Graph Detection**
- **API Endpoint**: `GET /learning/:id/graph`
- **Response**: 
  ```json
  {
    "learning": { /* learning data with nodes/edges */ },
    "hasGraph": true/false,
    "nodeCount": 5,
    "edgeCount": 4
  }
  ```

### ✅ **Creation Choice Modal**
- **Video Editor Option**: Auto-segmentation with AI
- **Manual Option**: Full creative control
- **Visual Design**: Cards with features and benefits
- **Smart Routing**: Handles learning ID persistence

### ✅ **Video-First Node Creation**
- **Required Upload**: Every node (except Start/End) needs video
- **Upload Modal**: Drag & drop or file browser
- **Auto-Title**: Generates title from filename
- **Preview**: Video preview before node creation

### ✅ **Existing Graph Loading**
- **Server Fetch**: Loads saved positions and data
- **File Reconstruction**: Recreates file references
- **ReactFlow Integration**: Converts to ReactFlow format
- **Preserves State**: Maintains all node configurations

### ✅ **Video Editor Integration**
- **localStorage Bridge**: Segments stored temporarily
- **Learning ID Tracking**: Ensures correct association
- **Auto-Conversion**: Segments become nodes automatically
- **Cleanup**: Removes temporary data after use

## 📋 API Endpoints

### 1. **Get Learning Graph**
```
GET /learning/:id/graph
Response: {
  learning: Learning & { nodes: Node[], edges: Edge[] },
  hasGraph: boolean,
  nodeCount: number,
  edgeCount: number
}
```

### 2. **Save Learning Graph** (existing)
```
POST /learning/save-learning-graph
Body: FormData with nodes, edges, and files
Response: { learning, nodes, edges }
```

## 🎨 User Interface Components

### 1. **GraphCreationChoice**
- **Location**: `/app/components/GraphCreationChoice.tsx`
- **Purpose**: Shows creation options when no graph exists
- **Features**: 
  - Video editor option with AI features
  - Manual creation option with full control
  - Visual cards with feature lists
  - Learning context display

### 2. **VideoUploadModal**
- **Location**: `/app/components/VideoUploadModal.tsx`
- **Purpose**: Requires video upload before node creation
- **Features**:
  - Drag & drop upload
  - Video preview
  - Auto-title generation
  - Position display
  - Validation

### 3. **GraphPage**
- **Location**: `/app/teacher/[id]/graph/page.tsx`
- **Purpose**: Decision logic for graph creation/loading
- **Features**:
  - Loading states
  - Error handling
  - Smart routing
  - Graph existence check

## 🔧 Technical Implementation

### Data Flow
```
My Courses → GraphPage → API Check → Decision:
├── Existing Graph → TeacherFlowBuilder (load data)
└── No Graph → GraphCreationChoice → Path:
    ├── Video Editor → Segments → TeacherFlowBuilder
    └── Manual → TeacherFlowBuilder (empty)
```

### File Handling
```
Node Creation:
1. Upload video (required)
2. Generate node with video file
3. Save preserves File objects
4. API upload handles multipart data
```

### State Management
```
- Graph Loading: React Query for server data
- Node State: ReactFlow useNodesState
- File State: UploadedFile with File references
- UI State: Modals, loading, errors
```

## 🚀 Usage Examples

### Example 1: New Course (No Graph)
```
1. User clicks "View" on new course
2. GraphPage detects no graph exists
3. Shows GraphCreationChoice modal
4. User selects "Create on Your Own"
5. Redirects to TeacherFlowBuilder (empty)
6. User right-clicks → VideoUploadModal appears
7. User uploads video → Node created with video
8. User continues building graph
9. Clicks "Save Flow" → Entire graph saved
```

### Example 2: Existing Course (Has Graph)
```
1. User clicks "View" on existing course
2. GraphPage detects graph exists
3. Redirects to TeacherFlowBuilder
4. Loads existing nodes and edges from server
5. Recreates file references and positions
6. User can edit existing graph
7. Save updates existing graph
```

### Example 3: Video Editor Path
```
1. User clicks "View" on new course
2. GraphCreationChoice appears
3. User selects "Create with Video Editor"
4. Stores learning ID in localStorage
5. Redirects to video editor
6. User creates segments
7. Segments stored in localStorage
8. Redirects to TeacherFlowBuilder
9. Auto-loads segments as nodes
10. User can modify and save
```

## 🎯 Business Logic

### Video Requirements
- **Start Node**: No video required (system node)
- **End Node**: No video required (system node)
- **Learning Nodes**: Video required (core content)
- **Materials**: Optional additional files

### Node Types
```typescript
type NodeType = 'start' | 'end' | 'step';
- start: System-generated, no video
- end: User-created, no video required
- step: User-created, video required
```

### File Structure
```typescript
UploadedFile {
  id: string;           // Unique identifier
  name: string;         // Original filename
  size: number;         // File size
  type: string;         // MIME type
  url: string;          // Preview URL (blob/server)
  uploadedAt: Date;     // Upload timestamp
  file?: File;          // Original File object
}
```

## 🔍 Error Handling

### Common Scenarios
1. **Learning Not Found**: 404 with back to courses option
2. **Network Errors**: Retry options and error messages
3. **File Upload Errors**: Clear validation messages
4. **Save Failures**: Detailed error feedback

### User Feedback
- **Loading States**: Spinners and progress indicators
- **Success Messages**: Confirmation with auto-hide
- **Error Messages**: Clear, actionable error text
- **Validation**: Real-time form validation

## 📊 Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Components loaded on demand
2. **React Query**: Caches API responses
3. **File Handling**: Efficient blob URL management
4. **State Updates**: Minimized re-renders

### File Upload Optimization
1. **Blob URLs**: Immediate preview without upload
2. **Batch Processing**: Multiple files in single request
3. **Error Recovery**: Retry failed uploads
4. **Progress Feedback**: Real-time upload status

## 🧪 Testing Scenarios

### Test Cases
1. **New Course Flow**: Complete creation workflow
2. **Existing Course Flow**: Loading and editing
3. **Video Editor Integration**: Segment conversion
4. **File Upload**: Various file types and sizes
5. **Error Scenarios**: Network failures, invalid data
6. **Edge Cases**: Empty graphs, corrupted data

### Manual Testing
1. Create new course → View → Choose manual → Create nodes
2. Create new course → View → Choose video editor → Create segments
3. Edit existing course → Verify data loads correctly
4. Test file uploads with various formats
5. Test save functionality with complex graphs

This comprehensive workflow provides a seamless, intelligent experience for creating and managing learning graphs with proper video content requirements and flexible creation options.