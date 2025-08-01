// Test script for VLM inference API
const testVLMInference = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/vlm-inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: 'https://edumotion.0e539d7214472d33064cfc853b35a792.r2.cloudflarestorage.com/file_node-1754046740593.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=389fe0d177c0b8a1d3fcb1ad482f301a%2F20250801%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20250801T170540Z&X-Amz-Expires=86400&X-Amz-Signature=78367793180506f7eb8443b3439e800f7ab97c1e8f971a95a4b4ee4ac9083d42&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject',
        threshold: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('VLM Inference Response:', result);
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testVLMInference();