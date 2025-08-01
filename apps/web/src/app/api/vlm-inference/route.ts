import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 VLM Inference API called');
    
    const { video_url, threshold } = await request.json();
    console.log('📥 Request data:', { video_url: video_url?.substring(0, 100) + '...', threshold });

    if (!video_url) {
      console.log('❌ No video URL provided');
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    console.log('🎥 Fetching video from URL...');
    // Fetch the video file from the URL
    const videoResponse = await fetch(video_url);
    if (!videoResponse.ok) {
      console.log('❌ Failed to fetch video:', videoResponse.statusText);
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    console.log('✅ Video fetched successfully, converting to blob...');
    const videoBlob = await videoResponse.blob();
    console.log('📊 Video blob size:', videoBlob.size, 'bytes');

    // Create FormData for the external API (only video file)
    const formData = new FormData();
    formData.append('video', videoBlob, 'node_video.mp4');
    
    // Threshold should be a query parameter
    const thresholdValue = threshold?.toString() || '0.5';
    const apiUrl = `http://127.0.0.1:8001/vlm-inference-comparison/?threshold=${thresholdValue}`;
    
    console.log('🚀 Calling VLM inference API with threshold:', thresholdValue);
    // Call the VLM inference API
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 VLM API response status:', apiResponse.status);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.log('❌ VLM API error response:', errorText);
      throw new Error(`API request failed: ${apiResponse.statusText} - ${errorText}`);
    }

    const result = await apiResponse.json();
    console.log('✅ VLM API success:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 VLM Inference API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process VLM inference request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}