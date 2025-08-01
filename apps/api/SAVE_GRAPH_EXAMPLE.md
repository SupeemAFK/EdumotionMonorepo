# Save Learning Graph API Usage Example

## Endpoint
`POST /learning/save-learning-graph`

## Content-Type
`multipart/form-data`

## Purpose
Adds nodes and edges to an **existing** learning record. The learning must already exist in the database.

## Request Structure

The request should include:
1. **JSON data** as form field `saveLearningGraphDto` 
2. **Files** with field names referenced in the JSON data

### JSON Structure (saveLearningGraphDto field)

```json
{
  "learningId": "existing-learning-uuid-here",
  "nodes": [
    {
      "id": "temp_node_1",
      "title": "What is Machine Learning?",
      "description": "Introduction to ML concepts",
      "positionX": 100,
      "positionY": 200,
      "algorithm": "basic",
      "type": "lecture",
      "threshold": 0.8,
      "videoFieldName": "node_1_video",
      "materialsFieldName": "node_1_materials"
    },
    {
      "id": "temp_node_2", 
      "title": "Linear Regression",
      "description": "Understanding linear regression",
      "positionX": 300,
      "positionY": 200,
      "algorithm": "regression",
      "type": "practical",
      "threshold": 0.7,
      "videoFieldName": "node_2_video",
      "materialsFieldName": "node_2_materials"
    }
  ],
  "edges": [
    {
      "fromNode": "temp_node_1",
      "toNode": "temp_node_2"
    }
  ]
}
```

### Files
- `node_1_video`: Video file for first node
- `node_1_materials`: Materials file for first node (optional)
- `node_2_video`: Video file for second node  
- `node_2_materials`: Materials file for second node (optional)

## JavaScript/Frontend Example

```javascript
async function saveGraph(graphData, nodeFiles) {
  const formData = new FormData();
  
  // Add JSON data
  formData.append('saveLearningGraphDto', JSON.stringify(graphData));
  
  // Add files
  Object.entries(nodeFiles).forEach(([fieldName, file]) => {
    formData.append(fieldName, file);
  });
  
  const response = await fetch('/learning/save-learning-graph', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

// Usage
const graphData = {
  learningId: "existing-learning-uuid-123", // Must be an existing learning ID
  nodes: [
    {
      id: "node1",
      title: "First Topic",
      description: "Introduction",
      positionX: 0,
      positionY: 0,
      algorithm: "basic",
      type: "video",
      threshold: 0.8,
      videoFieldName: "node1_video"
    }
  ],
  edges: []
};

const files = {
  'node1_video': videoFile // File object from input
};

saveGraph(graphData, files);
```

## Response Structure

```json
{
  "learning": {
    "id": "existing-learning-uuid-here",
    "title": "Introduction to Machine Learning",
    "description": "A comprehensive course on ML fundamentals",
    "tags": ["machine-learning", "ai", "beginner"],
    "level": "beginner",
    "rating": 4.5,
    "estimatedTime": 120,
    "creatorId": "user-123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "nodes": [
    {
      "id": "actual-uuid-1",
      "title": "What is Machine Learning?",
      "description": "Introduction to ML concepts",
      "video": "https://s3-url-to-video",
      "materials": "https://s3-url-to-materials",
      "positionX": 100,
      "positionY": 200,
      "learningId": "existing-learning-uuid-here",
      "algorithm": "basic",
      "type": "lecture", 
      "threshold": 0.8,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "edges": [
    {
      "id": "edge-uuid",
      "learningId": "existing-learning-uuid-here",
      "fromNode": "actual-uuid-1",
      "toNode": "actual-uuid-2",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Key Features

1. **Works with Existing Learning**: Adds nodes and edges to an already created learning record
2. **Atomic Operation**: All operations happen in a database transaction
3. **File Upload**: Each node can have video (required) and materials (optional) files
4. **ID Mapping**: Temporary node IDs in request are mapped to actual UUIDs
5. **Validation**: Validates that learning exists and required files are present
6. **Error Handling**: Comprehensive error messages for missing files or invalid references

## Error Cases

- **Learning not found**: `404 Not Found` - "Learning with ID {id} not found"
- **Missing video files**: `400 Bad Request` with specific error message
- **Invalid node references in edges**: `400 Bad Request`  
- **Database constraints**: `500 Internal Server Error`
- **File upload failures**: `500 Internal Server Error`