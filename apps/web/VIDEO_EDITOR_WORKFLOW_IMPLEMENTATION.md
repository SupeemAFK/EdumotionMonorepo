# Video Editor Workflow Implementation

## 🎯 **User Request**
> "After edit video complete from video-editor and user click create with that video segments create new graph use video segments to create nodes and redirect to that teacher/[id] about the position for new nodes that from video segments just make it randomly around "Start" node"

## ✅ **Implementation Summary**

### **1. Improved Node Positioning Logic**
**File**: `apps/web/src/app/components/TeacherFlowBuilder.tsx`

**Before**: Video segment nodes were placed in a linear pattern
```typescript
const position = {
  x: 250 + (index * 300), // Spread horizontally
  y: 200 + (index % 2 * 150) // Alternate vertically
};
```

**After**: Video segment nodes are placed randomly around the "Start" node
```typescript
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
```

### **2. Fixed Video Editor Redirect Flow**
**File**: `apps/web/src/app/components/VideoEditor.tsx`

**Before**: Video editor redirected to generic `/teacher` route
```typescript
router.push('/teacher');
```

**After**: Video editor redirects to the correct graph route for the specific learning
```typescript
// Get the pending learning ID and navigate to the graph route
const pendingLearningId = localStorage.getItem('pendingLearningId');
if (pendingLearningId) {
  // Navigate to graph route which will then redirect to teacher page with video segments loaded
  router.push(`/teacher/${pendingLearningId}/graph`);
} else {
  // Fallback to general teacher page if no pending learning ID
  router.push('/teacher');
}
```

### **3. Enhanced Graph Route Detection**
**File**: `apps/web/src/app/teacher/[id]/graph/page.tsx`

**Before**: Only checked for existing graph data from server
```typescript
if (graphData.hasGraph) {
  router.push(`/teacher/${params.id}`);
} else {
  setShowChoice(true);
}
```

**After**: Also checks for video segments from video editor
```typescript
if (graphData.hasGraph) {
  // Graph exists, redirect to teacher flow builder
  router.push(`/teacher/${params.id}`);
} else {
  // Check if there are video segments from the video editor
  const storedData = localStorage.getItem('videoSegments');
  const pendingLearningId = localStorage.getItem('pendingLearningId');
  
  if (storedData && pendingLearningId === params.id) {
    // Video segments exist, redirect to teacher page to load them
    router.push(`/teacher/${params.id}`);
  } else {
    // No graph and no video segments, show creation choices
    setShowChoice(true);
  }
}
```

## 🔄 **Complete Workflow**

### **Step 1: User Clicks "View" on Course**
- Navigates to `/teacher/{learningId}/graph`
- System checks if graph exists in database
- System checks if video segments exist in localStorage

### **Step 2A: If Graph Exists**
- Redirects to `/teacher/{learningId}`
- Loads existing graph with saved positions and data

### **Step 2B: If No Graph, Show Choices**
- Shows `GraphCreationChoice` component
- User can choose "Create with video editor" or "Create on your own"

### **Step 3: Video Editor Flow**
1. **User clicks "Create with video editor"**
   - `pendingLearningId` is stored in localStorage
   - Redirects to `/video-editor`

2. **User uploads video and creates segments**
   - Video is processed and segments are created
   - User can edit segment titles and descriptions

3. **User clicks "Confirm Segments"**
   - Video segments are stored in localStorage as `videoSegments`
   - Redirects to `/teacher/{learningId}/graph`

4. **Graph route detects video segments**
   - Finds video segments in localStorage for the correct learningId
   - Redirects to `/teacher/{learningId}`

5. **TeacherFlowBuilder loads video segments**
   - Reads video segments from localStorage
   - Creates nodes positioned randomly around the "Start" node
   - Creates sequential edges connecting the nodes
   - Cleans up localStorage
   - Sets initial graph state for change tracking

### **Step 4: Manual Creation Flow**
1. **User clicks "Create on your own"**
   - Directly redirects to `/teacher/{learningId}`
   - Shows empty graph with Start node only
   - User can right-click to add nodes (requires video upload first)

## 🎨 **Node Positioning Algorithm**

The new positioning algorithm creates a natural, organic layout:

1. **Find Start Node**: Locates the existing "Start" node position
2. **Circular Distribution**: Distributes nodes evenly around a circle
3. **Random Radius**: Each node gets a random distance (200-300px) from Start
4. **Random Offset**: Adds ±50px random offset for natural variation
5. **Result**: Nodes appear randomly scattered around the Start node in a pleasing pattern

### **Visual Example**:
```
     Node2
        •
   Node1 •     • Node4
      •    Start   •
         •     • Node3
       Node5
```

## 🔧 **Technical Implementation Details**

### **LocalStorage Data Structure**
```typescript
// Video segments data
{
  segments: Array<{
    id: string;
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    color: string;
  }>,
  videoFile: {
    name: string;
    size: number;
    type: string;
    url: string; // blob URL
  },
  timestamp: number
}

// Pending learning ID
pendingLearningId: string
```

### **Node Creation Process**
1. **Load video segments** from localStorage
2. **Validate freshness** (within 5 minutes)
3. **Find Start node** position for reference
4. **Create nodes** with random positions around Start
5. **Create sequential edges** connecting nodes in order
6. **Set initial state** for change tracking
7. **Clean up localStorage**

### **Edge Connection Logic**
- **First segment**: Connected to Start node
- **Subsequent segments**: Connected to previous segment
- **Sequential flow**: Creates a linear learning path through video segments

## 🧪 **Testing Scenarios**

### **Scenario 1: New Course with Video Editor**
1. ✅ User clicks "View" on new course
2. ✅ Shows creation choice modal
3. ✅ User clicks "Create with video editor"
4. ✅ Redirects to video editor with `pendingLearningId` stored
5. ✅ User uploads video and creates segments
6. ✅ User clicks "Confirm Segments"
7. ✅ Redirects to `/teacher/{id}/graph`
8. ✅ Detects video segments and redirects to `/teacher/{id}`
9. ✅ Loads video segments as nodes positioned around Start node
10. ✅ Creates sequential edges between nodes
11. ✅ Cleans up localStorage

### **Scenario 2: Existing Course with Graph**
1. ✅ User clicks "View" on existing course
2. ✅ Detects existing graph in database
3. ✅ Directly redirects to `/teacher/{id}`
4. ✅ Loads existing nodes and edges with saved positions

### **Scenario 3: Manual Creation**
1. ✅ User clicks "View" on new course
2. ✅ Shows creation choice modal
3. ✅ User clicks "Create on your own"
4. ✅ Directly redirects to `/teacher/{id}`
5. ✅ Shows empty graph with Start node only

## 🎯 **Benefits**

1. **Natural Layout**: Video segments appear organically around the Start node
2. **Correct Routing**: Video editor now redirects to the right learning course
3. **Seamless Flow**: Smooth transition from video editor to graph builder
4. **Automatic Cleanup**: localStorage is cleaned after successful loading
5. **Error Handling**: Fallback routes for edge cases
6. **Visual Appeal**: Random positioning creates more interesting graph layouts

## 🚀 **User Experience**

### **Before**:
- ❌ Video editor redirected to wrong route
- ❌ Linear node positioning looked mechanical
- ❌ No connection between video editor and specific learning

### **After**:
- ✅ Seamless flow from course → video editor → graph builder
- ✅ Natural, organic node positioning around Start node
- ✅ Proper routing with learningId context maintained
- ✅ Automatic graph creation from video segments
- ✅ Clean localStorage management

The video editor workflow is now complete and provides a smooth, intuitive experience for creating learning graphs from video content! 🎉