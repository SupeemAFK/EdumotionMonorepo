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

    // Step 1: Call Botnoi API to generate voice
    const botnoiApiUrl = 'https://api-genvoice.botnoi.ai/voice/v1/generate_voice?provider=studio';
    console.log('🚀 Calling Botnoi TTS API:', botnoiApiUrl);
    
    // Create text_delay with proper spacing for Thai text
    const text_delay = text.replace(/([.!?])/g, '$1 ').replace(/\s+/g, ' ').trim();
    
    const botnoiRequestBody = {
      "audio_id": "SGMRS",
      "text": text,
      "text_delay": text_delay,
      "speaker": "6",
      "volume": "100",
      "speed": "1",
      "type_media": "mp3",
      "language": "th",
      "speaker_v2": false
    };

    const botnoiResponse = await fetch(botnoiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTQyMTI4NjUsImlhdCI6MTc1NDEyNjQ2NSwibmJmIjoxNzU0MTI2NDY1LCJ1aWQiOiIwNTUyNjZiYy0xNDc1LTViOTEtYmNlMC00ZGFjOTcyNzAyNGMiLCJ1c2VyX2lkIjoiMWhWalp5c05pWlpENWJETWJGSTZTc3pBc040MyJ9.09luFQ0dJblK5iPWxc6gisl4tP4ztYBO7ZNsCO7T2b8'
      },
      body: JSON.stringify(botnoiRequestBody),
    });

    console.log('📡 Botnoi API response status:', botnoiResponse.status);
    if (!botnoiResponse.ok) {
      const errorText = await botnoiResponse.text();
      console.log('❌ Botnoi API error response:', errorText);
      throw new Error(`Botnoi API request failed: ${botnoiResponse.statusText} - ${errorText}`);
    }

    const botnoiResult = await botnoiResponse.json();
    console.log('✅ Botnoi API success, received response');

    // Step 2: Extract S3 URL from response
    const s3Url = botnoiResult.data;
    if (!s3Url) {
      console.log('❌ No S3 URL found in Botnoi response');
      throw new Error('No S3 URL found in Botnoi API response');
    }

    console.log('🔗 S3 URL received, fetching audio file...');

    // Step 3: Fetch audio file from S3 URL with required Referer header
    const audioResponse = await fetch(s3Url, {
      method: 'GET',
      headers: {
        'Referer': 'https://voice.botnoi.ai/'
      },
    });

    console.log('📡 S3 audio response status:', audioResponse.status);
    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.log('❌ S3 audio fetch error:', errorText);
      throw new Error(`S3 audio fetch failed: ${audioResponse.statusText} - ${errorText}`);
    }

    // Return the audio file
    console.log('✅ Audio file fetched successfully');
    const audioBlob = await audioResponse.blob();
    
    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/mp3',
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