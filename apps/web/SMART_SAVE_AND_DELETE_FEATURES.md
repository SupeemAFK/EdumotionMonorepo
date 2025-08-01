# Smart Save Button & Course Delete Features

## 🗑️ **Course Delete Functionality**

### Backend Implementation
- **API Endpoint**: `DELETE /learning/:id`
- **Cascade Delete Logic**: Deletes learning course and ALL associated data
  1. Delete all edges associated with the learning
  2. Delete all nodes associated with the learning  
  3. Delete the learning record itself
- **Transaction Safety**: Uses Prisma transaction to ensure atomicity
- **Response**: Returns success message and deleted learning data

### Frontend Implementation
- **React Query Mutation**: Handles delete API calls with proper error handling
- **UI Feedback**: Loading spinner and disabled state during deletion
- **Confirmation Dialog**: Double confirmation before deletion
- **Auto-refresh**: Automatically updates the course list after successful deletion
- **Error Handling**: User-friendly error messages

### Usage
```typescript
// User clicks delete button
// → Confirmation dialog appears
// → If confirmed, API call is made
// → Loading state shows "Deleting..."
// → Success: Course removed from list
// → Error: Error message displayed
```

## 💾 **Smart Save Button**

### Change Detection System
- **Initial State Tracking**: Captures graph state when loaded from server or video editor
- **Real-time Comparison**: Compares current state with initial state
- **Change Types Detected**:
  - Node position changes (drag & drop)
  - Node data changes (title, description, files, AI settings)
  - Node addition/deletion
  - Edge addition/deletion
  - Edge connection changes

### Smart UI Behavior
- **Conditional Visibility**: Save button only appears when changes are detected
- **Visual Indicators**: 
  - Orange "Unsaved changes" badge with pulsing dot
  - Save button with appropriate styling
- **State Management**: Tracks changes in real-time using React effects

### Save Process
1. **Pre-save Validation**: Checks for required video files on step nodes
2. **API Call**: Sends multipart form data with graph and files
3. **Success Handling**: 
   - Updates initial state to current state
   - Hides save button (no more unsaved changes)
   - Shows success message
4. **Error Handling**: Displays detailed error messages

## 🔧 **Technical Implementation**

### Change Detection Algorithm
```typescript
const hasGraphChanged = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
  if (!initialGraphState) return false;

  // Compare node count
  if (currentNodes.length !== initialGraphState.nodes.length) return true;
  
  // Compare each node
  for (const currentNode of currentNodes) {
    const initialNode = initialGraphState.nodes.find(n => n.id === currentNode.id);
    if (!initialNode) return true;
    
    // Check position changes
    if (currentNode.position.x !== initialNode.position.x || 
        currentNode.position.y !== initialNode.position.y) return true;
    
    // Check data changes
    if (JSON.stringify(currentNode.data) !== JSON.stringify(initialNode.data)) return true;
  }

  // Compare edges similarly...
  return false;
}, [initialGraphState]);
```

### State Management
```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [initialGraphState, setInitialGraphState] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);

// Track changes
useEffect(() => {
  if (initialGraphState && isLoaded) {
    const changed = hasGraphChanged(nodes, edges);
    setHasUnsavedChanges(changed);
  }
}, [nodes, edges, hasGraphChanged, initialGraphState, isLoaded]);
```

### Delete Mutation
```typescript
const deleteMutation = useMutation({
  mutationFn: async (learningId: string) => {
    const response = await api.delete(`/learning/${learningId}`);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['learning'] });
  },
  onError: (error: any) => {
    console.error('Delete failed:', error);
    alert('Failed to delete learning course. Please try again.');
  }
});
```

## 🎯 **User Experience**

### Smart Save Benefits
1. **Reduced Clutter**: No save button when not needed
2. **Clear Feedback**: Visual indication of unsaved changes
3. **Automatic Tracking**: No manual "mark as dirty" needed
4. **Performance**: Only saves when necessary

### Delete Safety
1. **Double Confirmation**: Prevents accidental deletions
2. **Clear Warning**: Explains what will be deleted (course + graph data)
3. **Loading Feedback**: Shows deletion progress
4. **Error Recovery**: Clear error messages if deletion fails

## 🔄 **Change Triggers**

### Actions that trigger "unsaved changes":
- ✅ Dragging nodes to new positions
- ✅ Adding new nodes (via right-click or video upload)
- ✅ Deleting nodes
- ✅ Connecting/disconnecting edges
- ✅ Editing node properties (title, description)
- ✅ Uploading/changing node files
- ✅ Modifying AI settings (model, threshold)

### Actions that reset "unsaved changes":
- ✅ Successful save operation
- ✅ Loading existing graph from server
- ✅ Loading video segments from video editor

## 🛡️ **Error Handling**

### Save Errors
- Missing video files for step nodes
- Network connectivity issues
- Server validation errors
- File upload failures

### Delete Errors
- Network connectivity issues
- Server errors
- Permission issues
- Database constraint violations

## 📱 **Responsive Design**

### Save Button Position
- **Desktop**: Top-right corner with indicator above
- **Mobile**: Adapts to smaller screens
- **Z-index**: High priority to stay visible

### Delete Button States
- **Normal**: Red border with trash icon
- **Loading**: Spinner with "Deleting..." text
- **Disabled**: Grayed out during operation

## 🚀 **Performance Optimizations**

1. **Debounced Comparisons**: Change detection uses efficient comparison
2. **Shallow Copying**: Minimal memory usage for state snapshots
3. **Conditional Rendering**: Save UI only renders when needed
4. **React Query Caching**: Efficient data fetching and updates

## 🧪 **Testing Scenarios**

### Smart Save Testing
1. Load existing graph → No save button shown
2. Move a node → Save button appears with indicator
3. Save successfully → Save button disappears
4. Add new node → Save button appears
5. Delete node → Save button appears

### Delete Testing
1. Click delete → Confirmation dialog appears
2. Cancel → No action taken
3. Confirm → Loading state shown
4. Success → Course removed from list
5. Error → Error message displayed

This implementation provides a polished, user-friendly experience with proper safety measures and clear visual feedback for both saving changes and deleting courses.