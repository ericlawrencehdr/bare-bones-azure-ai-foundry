import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const endpoint = process.env.AZURE_AI_ENDPOINT;
    const apiKey = process.env.AZURE_AI_API_KEY;

    if (!endpoint || !apiKey) {
      return NextResponse.json(
        { error: 'Azure AI configuration missing. Please set AZURE_AI_ENDPOINT and AZURE_AI_API_KEY in .env.local' },
        { status: 500 }
      );
    }
    // Call Azure AI Foundry with Flux 1.1 Pro
    // Azure AI Foundry typically uses /v1/chat/completions or /openai/deployments/{deployment-id}/...
    // Adjust the endpoint based on your Azure AI Foundry setup
    // const response = await fetch(`${endpoint}/v1/images/generations`, {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        // model: 'flux-1-1-pro',
        // output_format: 'url', // or 'b64_json' for base64
        output_format: 'png', // or 'b64_json' for base64
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Azure AI error:', errorData);
      return NextResponse.json(
        { error: `Azure AI request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Azure AI Foundry typically returns images in this format:
    // { data: [{ url: "...", b64_json: "..." }] }
    // Or it might return a direct URL or base64 encoded image
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json || data.url;

    if (!imageUrl) {
      console.error('Unexpected response structure:', data);
      return NextResponse.json(
        { error: 'No image URL in response. Check console for response structure.' },
        { status: 500 }
      );
    }

    // If it's base64, convert to data URL
    if (imageUrl.startsWith('iVBOR') || !imageUrl.startsWith('http')) {
      return NextResponse.json({ imageUrl: `data:image/png;base64,${imageUrl}` });
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
