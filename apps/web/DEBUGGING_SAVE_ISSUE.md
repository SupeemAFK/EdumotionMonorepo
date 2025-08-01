# Debugging Save Flow Issues

## 🔍 Recent Changes Made

### Backend Fixes
1. **Controller**: Changed from `FilesInterceptor('files')` to `AnyFilesInterceptor()` to handle dynamic field names
2. **DTO Parsing**: Updated to manually parse JSON string from FormData
3. **Validation**: Added debugging logs to see received data
4. **File Handling**: Skip validation for Start/End nodes

### Frontend Fixes  
1. **Data Structure**: Only include algorithm/threshold for step nodes (not undefined)
2. **File Validation**: Check for missing video files before sending
3. **Error Handling**: Better error message display
4. **Debugging**: Added detailed console logs

## 🚨 Common Issues & Solutions

### Issue 1: "Bad Request" Error
**Symptoms**: 400 Bad Request when clicking Save
**Possible Causes**:
- Missing required fields in DTO validation
- Invalid JSON structure in FormData
- File interceptor not capturing files properly

**Debug Steps**:
1. Open browser DevTools → Network tab
2. Click Save and look for the request
3. Check request payload and response
4. Look at backend console logs

### Issue 2: File Upload Issues
**Symptoms**: "Missing video file" errors
**Possible Causes**:
- File field names don't match expected names
- Files not properly appended to FormData
- Step nodes missing required video files

**Debug Steps**:
1. Check console logs for FormData entries
2. Verify step nodes have video files
3. Check file field name matching

### Issue 3: Validation Errors
**Symptoms**: DTO validation failures
**Possible Causes**:
- Required fields missing or wrong type
- Nested validation failing on nodes/edges
- JSON parsing issues

## 🔧 Debug Checklist

### Frontend (Browser Console)
```javascript
// Check what data is being sent
console.log('Saving graph data:', JSON.stringify(graphData, null, 2));
console.log('FormData entries:', Array.from(formData.entries()));

// Check node types
nodes.forEach(node => {
  console.log(`Node ${node.id}: type=${node.data.isStartNode ? 'start' : node.data.isEndNode ? 'end' : 'step'}`);
});
```

### Backend (Server Console)
```typescript
// Check received data
console.log('Received DTO:', saveLearningGraphDto);
console.log('Received files:', files.map(f => f.fieldname));
```

### Network Tab
- Request URL: `/learning/save-learning-graph`
- Method: POST
- Content-Type: `multipart/form-data`
- Payload: Check FormData structure

## 🎯 Step-by-Step Debugging

### Step 1: Verify Basic Setup
1. ✅ API server running on port 3001
2. ✅ Frontend can reach API
3. ✅ Learning ID exists in database

### Step 2: Check Data Structure
```javascript
// Expected node structure for different types:

// Start Node
{
  id: "start_1",
  title: "Start", 
  description: "Beginning",
  positionX: 0,
  positionY: 0,
  type: "start"
  // No algorithm, threshold, videoFieldName, materialsFieldName
}

// Step Node  
{
  id: "step_1",
  title: "Learning Step",
  description: "Content", 
  positionX: 100,
  positionY: 0,
  type: "step",
  algorithm: "basic",
  threshold: 0.8,
  videoFieldName: "step_1_video" // Only if video exists
}

// End Node
{
  id: "end_1", 
  title: "End",
  description: "Completion",
  positionX: 200,
  positionY: 0,
  type: "end"
  // No algorithm, threshold, videoFieldName, materialsFieldName
}
```

### Step 3: Check File Handling
```javascript
// For step nodes with videos:
formData.append('step_1_video', videoFile);

// FormData should contain:
// - 'saveLearningGraphDto': JSON string
// - 'step_1_video': File object (if step node has video)
// - 'step_1_materials': File object (if step node has materials)
```

### Step 4: Validate API Response
```javascript
// Success Response (200)
{
  message: "Learning graph saved successfully",
  learning: { ... },
  nodes: [...],
  edges: [...]
}

// Error Response (400)
{
  statusCode: 400,
  message: "Validation failed: ...",
  error: "Bad Request"
}
```

## 🛠️ Quick Fixes

### Fix 1: Empty Graph Issue
```javascript
// Add validation before save
if (nodes.length === 0) {
  setSaveError('Cannot save empty graph. Please add at least one node.');
  return;
}
```

### Fix 2: Missing Video Files
```javascript
// Check step nodes have videos
const stepNodes = nodes.filter(node => !node.data.isStartNode && !node.data.isEndNode);
const missingVideoNodes = stepNodes.filter(node => !node.data.files.some(f => f.type.includes('video')));

if (missingVideoNodes.length > 0) {
  setSaveError(`Missing videos for: ${missingVideoNodes.map(n => n.data.label).join(', ')}`);
  return;
}
```

### Fix 3: Invalid Learning ID
```javascript
// Verify learning ID format
if (!learningId || !learningId.match(/^[a-f\d-]{36}$/i)) {
  setSaveError('Invalid learning ID format');
  return;
}
```

## 🧪 Test Cases

### Test 1: Start + End Only
- Create graph with just Start and End nodes
- Should save successfully (no files required)

### Test 2: Start + Step + End  
- Add one step node with video
- Should require video upload
- Should save successfully

### Test 3: Complex Graph
- Multiple step nodes with videos and materials
- Should validate all files present
- Should save all nodes and edges

## 📝 Expected Behavior

1. **Start/End Nodes**: Save without files, algorithm, or threshold
2. **Step Nodes**: Require video, optional materials, optional AI settings
3. **Validation**: Clear error messages for missing requirements
4. **Success**: Confirmation message and data persistence

## 🔍 Debugging Commands

```bash
# Check API logs
cd apps/api && npm run start:dev

# Test simple save (Start + End only)
node test-simple-save.js

# Test full save (with files)  
node test-save-graph.js

# Check database
npx prisma studio
```

## 📞 If Still Stuck

1. Check browser Network tab for exact error response
2. Check backend console for validation errors  
3. Verify database schema matches expectations
4. Test with simple Start+End graph first
5. Add step nodes incrementally

The most likely issue is either:
- File interceptor not working with dynamic field names ✅ (Fixed)
- DTO validation failing on optional fields ✅ (Fixed)  
- JSON parsing from FormData ✅ (Fixed)
- Missing video files for step nodes (Check this!)