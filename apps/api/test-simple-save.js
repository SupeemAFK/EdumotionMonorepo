const FormData = require('form-data');
const fetch = require('node-fetch');

async function testSimpleSave() {
    const API_BASE_URL = 'http://localhost:3001';
    const LEARNING_ID = 'learning-test-123'; // Replace with actual learning ID

    console.log('🧪 Testing Simple Save Learning Graph...\n');

    try {
        const form = new FormData();

        // Simple graph with just start and end nodes
        const graphData = {
            learningId: LEARNING_ID,
            nodes: [
                {
                    id: "start_node",
                    title: "Start",
                    description: "Beginning of the learning flow",
                    positionX: 50,
                    positionY: 200,
                    type: "start"
                },
                {
                    id: "end_node", 
                    title: "End",
                    description: "End of the learning flow",
                    positionX: 300,
                    positionY: 200,
                    type: "end"
                }
            ],
            edges: [
                {
                    fromNode: "start_node",
                    toNode: "end_node"
                }
            ]
        };

        // Add JSON data to form
        form.append('saveLearningGraphDto', JSON.stringify(graphData));

        console.log('📤 Sending request to:', `${API_BASE_URL}/learning/save-learning-graph`);
        console.log('📄 Graph data:', JSON.stringify(graphData, null, 2));

        // Make the request
        const response = await fetch(`${API_BASE_URL}/learning/save-learning-graph`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📄 Response body:', responseText);

        if (response.ok) {
            console.log('✅ SUCCESS: Graph saved successfully!');
            try {
                const responseData = JSON.parse(responseText);
                console.log('📋 Response data:', JSON.stringify(responseData, null, 2));
            } catch (e) {
                console.log('📋 Response (non-JSON):', responseText);
            }
        } else {
            console.log('❌ FAILED: Request failed');
            console.log('💬 Error details:', responseText);
        }

    } catch (error) {
        console.error('💥 ERROR:', error.message);
        console.error('🔍 Stack:', error.stack);
    }
}

testSimpleSave();