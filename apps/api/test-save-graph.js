const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3001'; // Adjust this to your API URL
const LEARNING_ID = '14e072ee-05fc-4127-b5db-bc76f388e7c4'; // Replace with actual learning ID

async function testSaveGraph() {
  try {
    console.log('🚀 Testing Save Learning Graph API...\n');

    // Create form data
    const form = new FormData();

    // Sample graph data
    const graphData = {
      learningId: LEARNING_ID,
      nodes: [
        {
          id: "start_node",
          title: "Start",
          description: "Beginning of the learning flow",
          positionX: 50,
          positionY: 200,
          type: "start",
          // No algorithm, threshold, or file fields for start node
        },
        {
          id: "temp_node_1",
          title: "Introduction to JavaScript",
          description: "Basic concepts of JavaScript programming",
          positionX: 200,
          positionY: 200,
          algorithm: "basic",
          type: "step",
          threshold: 0.8,
          videoFieldName: "node_1_video",
          materialsFieldName: "node_1_materials"
        },
        {
          id: "temp_node_2",
          title: "Variables and Data Types",
          description: "Understanding JavaScript variables",
          positionX: 350,
          positionY: 200,
          algorithm: "intermediate",
          type: "step",
          threshold: 0.7,
          videoFieldName: "node_2_video"
        },
        {
          id: "end_node",
          title: "End",
          description: "End of the learning flow",
          positionX: 500,
          positionY: 200,
          type: "end",
          // No algorithm, threshold, or file fields for end node
        }
      ],
      edges: [
        {
          fromNode: "start_node",
          toNode: "temp_node_1"
        },
        {
          fromNode: "temp_node_1",
          toNode: "temp_node_2"
        },
        {
          fromNode: "temp_node_2",
          toNode: "end_node"
        }
      ]
    };

    // Add JSON data to form
    form.append('saveLearningGraphDto', JSON.stringify(graphData));

    // Create dummy files for testing (you can replace these with actual files)
    const dummyVideoContent = Buffer.from('This is a dummy video file for testing');
    const dummyMaterialsContent = Buffer.from('This is a dummy materials file for testing');

    // Add files to form
    form.append('node_1_video', dummyVideoContent, {
      filename: 'intro-video.mp4',
      contentType: 'video/mp4'
    });
    
    form.append('node_1_materials', dummyMaterialsContent, {
      filename: 'intro-materials.pdf',
      contentType: 'application/pdf'
    });
    
    form.append('node_2_video', dummyVideoContent, {
      filename: 'variables-video.mp4',
      contentType: 'video/mp4'
    });

    console.log('📤 Sending request to:', `${API_BASE_URL}/learning/save-learning-graph`);
    console.log('📊 Graph data:', JSON.stringify(graphData, null, 2));
    console.log('📁 Files being uploaded:');
    console.log('  - node_1_video: intro-video.mp4');
    console.log('  - node_1_materials: intro-materials.pdf');
    console.log('  - node_2_video: variables-video.mp4\n');

    // Make the request
    const response = await fetch(`${API_BASE_URL}/learning/save-learning-graph`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    console.log('📨 Response status:', response.status, response.statusText);

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success! Graph saved successfully');
      console.log('📋 Response data:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Error occurred:');
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your API server is running on', API_BASE_URL);
    }
  }
}

// Helper function to test with actual files
async function testWithRealFiles(videoFilePath, materialsFilePath) {
  try {
    console.log('🚀 Testing Save Learning Graph API with real files...\n');

    const form = new FormData();

    const graphData = {
      learningId: LEARNING_ID,
      nodes: [
        {
          id: "temp_node_1",
          title: "Real File Test",
          description: "Testing with actual files",
          positionX: 100,
          positionY: 200,
          algorithm: "basic",
          type: "lecture",
          threshold: 0.8,
          videoFieldName: "node_1_video",
          materialsFieldName: "node_1_materials"
        }
      ],
      edges: []
    };

    form.append('saveLearningGraphDto', JSON.stringify(graphData));

    // Add real files
    if (fs.existsSync(videoFilePath)) {
      form.append('node_1_video', fs.createReadStream(videoFilePath));
      console.log('📹 Added video file:', videoFilePath);
    } else {
      console.log('⚠️  Video file not found:', videoFilePath);
      return;
    }

    if (materialsFilePath && fs.existsSync(materialsFilePath)) {
      form.append('node_1_materials', fs.createReadStream(materialsFilePath));
      console.log('📄 Added materials file:', materialsFilePath);
    }

    const response = await fetch(`${API_BASE_URL}/learning/save-learning-graph`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    console.log('\n📨 Response status:', response.status, response.statusText);
    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success! Graph with real files saved successfully');
      console.log('📋 Response data:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Error occurred:');
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
console.log('🔧 Before running this test:');
console.log('1. Make sure your API server is running');
console.log('2. Update the LEARNING_ID variable with an existing learning ID');
console.log('3. Install required dependencies: npm install form-data\n');

// Uncomment the test you want to run:
testSaveGraph();

// To test with real files, uncomment this line and provide file paths:
// testWithRealFiles('./test-video.mp4', './test-materials.pdf');