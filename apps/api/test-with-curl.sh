#!/bin/bash

# Test Save Learning Graph API with curl
# Make sure to update the LEARNING_ID variable below

API_URL="http://localhost:3000"
LEARNING_ID="your-existing-learning-id-here"  # Replace with actual learning ID

echo "🚀 Testing Save Learning Graph API with curl..."
echo "📡 API URL: $API_URL"
echo "🆔 Learning ID: $LEARNING_ID"
echo ""

# Create temporary test files
echo "📁 Creating temporary test files..."
echo "This is a test video file" > test-video.txt
echo "This is a test materials file" > test-materials.txt

# Prepare JSON data
JSON_DATA='{
  "learningId": "'$LEARNING_ID'",
  "nodes": [
    {
      "id": "temp_node_1",
      "title": "Curl Test Node 1",
      "description": "Testing with curl command",
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
      "title": "Curl Test Node 2",
      "description": "Second node for testing",
      "positionX": 300,
      "positionY": 200,
      "algorithm": "intermediate",
      "type": "practical",
      "threshold": 0.7,
      "videoFieldName": "node_2_video"
    }
  ],
  "edges": [
    {
      "fromNode": "temp_node_1",
      "toNode": "temp_node_2"
    }
  ]
}'

echo "📤 Sending request..."
echo "JSON Data:"
echo "$JSON_DATA" | jq . 2>/dev/null || echo "$JSON_DATA"
echo ""

# Make the curl request
curl -X POST "$API_URL/learning/save-learning-graph" \
  -H "Content-Type: multipart/form-data" \
  -F "saveLearningGraphDto=$JSON_DATA" \
  -F "node_1_video=@test-video.txt;type=video/mp4" \
  -F "node_1_materials=@test-materials.txt;type=application/pdf" \
  -F "node_2_video=@test-video.txt;type=video/mp4" \
  -w "\n\n📊 Response Info:\n- Status Code: %{http_code}\n- Total Time: %{time_total}s\n- Upload Speed: %{speed_upload} bytes/s\n" \
  -s

echo ""

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -f test-video.txt test-materials.txt

echo "✅ Test completed!"
echo ""
echo "💡 Tips:"
echo "- Make sure your API server is running on $API_URL"
echo "- Update the LEARNING_ID variable with a real learning ID"
echo "- Install jq for better JSON formatting: sudo apt install jq (Linux) or brew install jq (Mac)"