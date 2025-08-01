# Frontend TeacherFlowBuilder Testing Guide

## Overview
The TeacherFlowBuilder has been updated to integrate with the `save-learning-graph` API endpoint. When you click "Save Flow", it will:

1. **Collect all nodes and edges** from the flow
2. **Extract files** from each node (videos and materials)
3. **Convert file URLs to File objects** for upload
4. **Send multipart form data** to `/learning/save-learning-graph`
5. **Show loading, success, and error states**

## How to Test

### Step 1: Start Your Servers
```bash
# Terminal 1: Start the API server
cd apps/api
npm run dev  # Should run on http://localhost:3001

# Terminal 2: Start the web server  
cd apps/web
npm run dev  # Should run on http://localhost:3000
```

### Step 2: Create a Learning Record
First, you need an existing learning record. You can either:

**Option A: Use the existing test script**
```bash
cd apps/api
node test-save-graph.js  # This will show you how to create a learning first
```

**Option B: Create via API directly**
```bash
curl -X POST http://localhost:3001/learning \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Learning Path",
    "description": "A test learning path for flow builder",
    "tags": ["test", "flow-builder"],
    "level": "beginner",
    "rating": 4.0,
    "estimatedTime": 60,
    "creatorId": "test-user-123"
  }'
```

Copy the returned `id` from the response.

### Step 3: Open the Flow Builder
Navigate to: `http://localhost:3000/teacher/[LEARNING_ID]`

Replace `[LEARNING_ID]` with the actual learning ID you got from Step 2.

Example: `http://localhost:3000/teacher/14e072ee-05fc-4127-b5db-bc76f388e7c4`

### Step 4: Build Your Flow
1. **Add nodes**: Right-click on empty space → "Add Step Node"
2. **Configure nodes**: Click on a node to open the sidebar
3. **Upload files**: In the sidebar, upload video and material files for each node
4. **Connect nodes**: Drag from one node's bottom handle to another node's top handle
5. **Add more nodes**: Create a complete learning flow

### Step 5: Save the Flow
1. Click the **"Save Flow"** button in the top-right corner
2. Watch the button states:
   - **"Saving..."** with spinner (loading)
   - **"Saved!"** with checkmark (success)
   - **Error message** appears below if something fails

## Expected Behavior

### Success Case
- Button shows "Saving..." with spinner
- Files are uploaded to S3
- Nodes and edges are created in database
- Button shows "Saved!" with green checkmark
- Success state disappears after 3 seconds

### Error Cases
- **No Learning ID**: "Learning ID is required"
- **Learning Not Found**: "Learning with ID {id} not found"
- **Missing Files**: "Missing video file for node {id}"
- **Network Error**: Connection error messages
- **Server Error**: API error messages

## File Handling

The system handles files as follows:

1. **File Storage**: Files are stored as URLs in the node's `files` array
2. **Upload Process**: URLs are converted to File objects before upload
3. **Field Naming**: Files are named as `{nodeId}_video` and `{nodeId}_materials`
4. **File Types**: 
   - Videos: Any file with `video/` MIME type
   - Materials: All other files (PDFs, images, etc.)

## API Integration

The frontend sends data in this format:

```javascript
// FormData structure
{
  saveLearningGraphDto: JSON.stringify({
    learningId: "uuid-here",
    nodes: [
      {
        id: "node-123",
        title: "Node Title",
        description: "Node Description", 
        positionX: 100,
        positionY: 200,
        algorithm: "basic",
        type: "step",
        threshold: 0.8,
        videoFieldName: "node-123_video",
        materialsFieldName: "node-123_materials"
      }
    ],
    edges: [
      {
        fromNode: "start",
        toNode: "node-123"
      }
    ]
  }),
  "node-123_video": File,
  "node-123_materials": File
}
```

## Debugging

### Check Browser Console
- Open Developer Tools → Console
- Look for "Saving graph data:" to see what's being sent
- Check for any error messages

### Check Network Tab
- Open Developer Tools → Network
- Look for the POST request to `/learning/save-learning-graph`
- Check request payload and response

### Check API Logs
- Look at your API server console for any error messages
- Check if files are being uploaded to S3 correctly

### Verify Database
- Check if nodes and edges are created in your database
- Verify the learning record exists and is updated

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your API server allows requests from localhost:3000
2. **File Upload Errors**: Check S3 configuration and credentials
3. **Database Errors**: Verify database connection and schema
4. **Learning Not Found**: Make sure you're using a valid learning ID in the URL

### Environment Variables
Make sure these are set in your `.env` files:

**API (.env)**:
```
DATABASE_URL=your-database-url
S3_REGION=your-s3-region
S3_ENDPOINT=your-s3-endpoint
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

**Web (.env.local)**:
```
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

## Success Indicators

✅ **Frontend Working**: Flow builder loads, nodes can be added and configured
✅ **File Upload Working**: Files can be uploaded to nodes via sidebar
✅ **API Integration**: Save button triggers API call without errors
✅ **Database Storage**: Nodes and edges appear in database after save
✅ **S3 Storage**: Files are uploaded and accessible via returned URLs

## Next Steps

After successful testing, you can:
1. Add more sophisticated error handling
2. Implement progress indicators for large file uploads
3. Add auto-save functionality
4. Implement loading existing flows from database
5. Add validation for required fields before saving