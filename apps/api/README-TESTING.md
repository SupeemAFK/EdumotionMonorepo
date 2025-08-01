# Testing the Save Learning Graph API

This directory contains several ways to test the `save-learning-graph` API endpoint.

## Prerequisites

1. **API Server Running**: Make sure your NestJS API server is running on `http://localhost:3000`
2. **Existing Learning Record**: You need an existing learning ID in your database
3. **Environment Setup**: Ensure your S3 credentials and database are properly configured

## Testing Options

### 1. Node.js Test Script (Recommended)

**File**: `test-save-graph.js`

```bash
# Install dependencies
npm install form-data

# Update the LEARNING_ID in the file, then run:
node test-save-graph.js
```

**Features**:
- ✅ Creates dummy files for testing
- ✅ Sends proper multipart form data
- ✅ Detailed console output
- ✅ Error handling and helpful messages
- ✅ Option to test with real files

### 2. HTTP Client File

**File**: `test-api.http`

Use with VS Code REST Client extension or similar HTTP clients:

1. Install "REST Client" extension in VS Code
2. Update the `learningId` in the file
3. Place test files in `./test-files/` directory
4. Click "Send Request" above each test

### 3. Curl Script

**File**: `test-with-curl.sh`

```bash
# Make executable
chmod +x test-with-curl.sh

# Update LEARNING_ID in the file, then run:
./test-with-curl.sh
```

**Features**:
- ✅ Works on any Unix-like system
- ✅ Creates temporary test files
- ✅ Detailed response information
- ✅ Automatic cleanup

## Quick Setup

### Option A: Using the Node.js script

```bash
# 1. Install dependencies
npm install form-data

# 2. Create a learning record first (if needed)
curl -X POST http://localhost:3000/learning \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Learning Path",
    "description": "A test learning path",
    "tags": ["test"],
    "level": "beginner", 
    "rating": 4.0,
    "estimatedTime": 60,
    "creatorId": "test-user-123"
  }'

# 3. Copy the returned ID and update LEARNING_ID in test-save-graph.js

# 4. Run the test
node test-save-graph.js
```

### Option B: Using curl directly

```bash
# Test with a simple curl command
curl -X POST http://localhost:3000/learning/save-learning-graph \
  -F 'saveLearningGraphDto={"learningId":"YOUR_LEARNING_ID","nodes":[{"id":"test1","title":"Test Node","description":"Test","positionX":0,"positionY":0,"algorithm":"basic","type":"lecture","threshold":0.8,"videoFieldName":"test_video"}],"edges":[]}' \
  -F 'test_video=@/path/to/your/video/file.mp4'
```

## Expected Response

Success response (200):
```json
{
  "learning": {
    "id": "existing-learning-id",
    "title": "Your Learning Title",
    // ... other learning fields
  },
  "nodes": [
    {
      "id": "generated-uuid",
      "title": "Test Node",
      "video": "https://s3-url-to-uploaded-video",
      "materials": "https://s3-url-to-uploaded-materials",
      // ... other node fields
    }
  ],
  "edges": [
    // ... created edges
  ]
}
```

## Common Issues

### 1. Learning Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Learning with ID {id} not found"
}
```
**Solution**: Create a learning record first or use an existing valid ID.

### 2. Missing Video Files (400)
```json
{
  "statusCode": 400,
  "message": "Missing video file for node {id}: expected field {fieldName}"
}
```
**Solution**: Ensure all nodes with `videoFieldName` have corresponding files uploaded.

### 3. Connection Refused
**Solution**: Make sure your API server is running on the correct port.

### 4. S3 Upload Errors
**Solution**: Check your S3 credentials and bucket configuration.

## File Structure for Testing

```
apps/api/
├── test-save-graph.js          # Node.js test script
├── test-api.http              # HTTP client file
├── test-with-curl.sh          # Bash script with curl
├── package-test.json          # Dependencies for testing
└── test-files/               # Directory for test files (create this)
    ├── intro-video.mp4
    ├── intro-materials.pdf
    └── variables-video.mp4
```

## Tips

1. **Start Simple**: Use the Node.js script with dummy files first
2. **Check Logs**: Monitor your API server logs for detailed error messages
3. **Database**: Verify the learning record exists before testing
4. **File Sizes**: Start with small test files to avoid timeout issues
5. **Network**: Ensure your S3 endpoint is accessible from your development environment