import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔊 TTS API proxy called');
    
    const { text } = await request.json();
    console.log('📥 TTS Request data:', { text: text?.substring(0, 100) + (text?.length > 100 ? '...' : '') });

    if (!text) {
      console.log('❌ No text provided for TTS');
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Call the external TTS API
    const ttsApiUrl = 'http://127.0.0.1:8001/tts';
    console.log('🚀 Calling external TTS API:', ttsApiUrl);
    
    const apiResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      }),
    });

    console.log('📡 TTS API response status:', apiResponse.status);
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.log('❌ TTS API error response:', errorText);
      throw new Error(`TTS API request failed: ${apiResponse.statusText} - ${errorText}`);
    }

    // TTS API returns audio file (.wav)
    console.log('✅ TTS API success - received audio file');
    const audioBlob = await apiResponse.blob();
    
    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/wav',
      },
    });

  } catch (error) {
    console.error('💥 TTS API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process TTS request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}