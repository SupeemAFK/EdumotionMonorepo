# Save Issues Fixes

## 🐛 **Issues Identified**

### Issue 1: Existing Graphs Can't Save
**Problem**: Graphs loaded from the server have file URLs instead of File objects, causing save failures.
**Root Cause**: The save logic expected File objects but existing nodes only had server URLs.

### Issue 2: New Graphs Can't Save  
**Problem**: New graphs couldn't save because comparison logic failed when `initialGraphState` was null.
**Root Cause**: Change detection returned `false` for new graphs, so save button never appeared.

## ✅ **Fixes Applied**

### Fix 1: Smart File Handling
**Backend Changes**:
- **Upsert Logic**: Changed from always creating new nodes to using `upsert` (update if exists, create if new)
- **File Preservation**: Existing file URLs are preserved when no new files are uploaded
- **Smart Validation**: Only require video files for new nodes or nodes without existing videos

**Frontend Changes**:
- **Selective Upload**: Only upload files that are actual File objects or blob URLs (from video editor)
- **Skip Server URLs**: Don't try to re-upload files that are already stored on the server
- **Better Validation**: Check for video files in node data, not just FormData

### Fix 2: New Graph Change Detection
**Frontend Changes**:
- **Null State Handling**: When `initialGraphState` is null, consider changes if non-system nodes exist
- **Initial State Setting**: Set initial state for new graphs after they're loaded
- **Smart Comparison**: Differentiate between new graphs and existing graphs

## 🔧 **Technical Implementation**

### Backend: Smart Node Management
```typescript
// Use upsert to handle both new and existing nodes
const createdNode = await prisma.node.upsert({
  where: { id: actualNodeId },
  update: {
    // Update existing node data
    title: nodeDto.title,
    video: finalVideoUrl, // Keep existing if no new upload
    // ... other fields
  },
  create: {
    // Create new node
    id: actualNodeId,
    video: finalVideoUrl,
    // ... all fields
  },
});
```

### Backend: File URL Preservation
```typescript
// Determine final file URLs (use new uploads if available, otherwise keep existing)
const finalVideoUrl = (nodeDto.type === 'start' || nodeDto.type === 'end') ? null :
  (fileUrls.videoUrl || existingNode?.video || null);
```

### Frontend: Smart Change Detection
```typescript
const hasGraphChanged = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
  if (!initialGraphState) {
    // For new graphs, consider changes if we have more than just start/end nodes
    const nonSystemNodes = currentNodes.filter(node => 
      !node.data.isStartNode && !node.data.isEndNode
    );
    return nonSystemNodes.length > 0 || currentEdges.length > 0;
  }
  // ... existing comparison logic
}, [initialGraphState]);
```

### Frontend: Selective File Upload
```typescript
// Only upload new files, not existing server URLs
if (videoFile && videoFile.file) {
  formData.append(`${node.id}_video`, videoFile.file);
} else if (videoFile && videoFile.url && videoFile.url.startsWith('blob:')) {
  // Only convert blob URLs (from video editor), not server URLs
  const file = await urlToFile(videoFile.url, videoFile.name, videoFile.type);
  formData.append(`${node.id}_video`, file);
}
// Skip video files that are already server URLs (existing files)
```

## 🎯 **How It Works Now**

### For Existing Graphs:
1. **Load**: Graph loads with existing file URLs
2. **Change Detection**: Detects position changes, new nodes, etc.
3. **Save**: Only uploads new/changed files, preserves existing ones
4. **Backend**: Updates nodes with new data, keeps existing file URLs

### For New Graphs:
1. **Initialize**: Start with just Start/End nodes
2. **Change Detection**: Detects when user adds content nodes
3. **Save Button**: Appears when non-system nodes are added
4. **Save**: Uploads all files for new nodes

### For Video Editor Graphs:
1. **Load Segments**: Video segments loaded as blob URLs
2. **Change Detection**: Detects the loaded segments as changes
3. **Save**: Converts blob URLs to File objects and uploads

## 🛡️ **Validation Logic**

### Backend Validation:
```typescript
// For step nodes, check if they have video (either uploaded now or already exist)
const hasVideoFile = node.videoFieldName && fileFieldNames.includes(node.videoFieldName);
const hasExistingVideo = existingNode && existingNode.video;

if (!hasVideoFile && !hasExistingVideo) {
  throw new BadRequestException(`Node ${node.id} requires a video file.`);
}
```

### Frontend Validation:
```typescript
// Validate step nodes have required video files (either uploaded now or already exist)
const stepNodes = nodes.filter(node => !node.data.isStartNode && !node.data.isEndNode);
const missingVideoNodes = stepNodes.filter(node => {
  const hasVideoFile = node.data.files.some(file => file.type.includes('video'));
  return !hasVideoFile;
});
```

## 🔄 **Save Process Flow**

### 1. Frontend Preparation:
- Collect node and edge data
- Only include files that need uploading (new File objects or blob URLs)
- Skip existing server URLs

### 2. Backend Processing:
- Get existing nodes to preserve file URLs
- Delete and recreate edges (they're simple)
- Upsert nodes (update existing, create new)
- Preserve existing file URLs when no new files uploaded

### 3. Result:
- ✅ Existing graphs save without re-uploading files
- ✅ New graphs save when content is added
- ✅ Video editor graphs save properly
- ✅ File URLs are preserved correctly

## 🎉 **Benefits**

1. **Performance**: Don't re-upload existing files
2. **Reliability**: Handle both new and existing graphs
3. **User Experience**: Save button appears when needed
4. **Data Integrity**: Preserve existing file references
5. **Flexibility**: Support all graph creation methods

## 🧪 **Test Scenarios**

### ✅ Existing Graph - No Changes:
- Load existing graph → No save button (no changes)

### ✅ Existing Graph - Position Changes:
- Move nodes → Save button appears → Save succeeds (no file uploads)

### ✅ Existing Graph - Add New Node:
- Add node with video → Save button appears → Save succeeds (only new files uploaded)

### ✅ New Graph - Add Content:
- Start with Start/End → Add step node → Save button appears → Save succeeds

### ✅ Video Editor Graph:
- Load segments → Save button appears → Save succeeds (blob URLs converted to files)

The save functionality now works correctly for all scenarios! 🚀