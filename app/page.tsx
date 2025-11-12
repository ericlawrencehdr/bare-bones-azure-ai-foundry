'use client';

import { useState } from 'react';
import Image from 'next/image';
const defaultPrompt = 'Architecture, Museum, Brutalist, Soft Sunlight, Spring Bloom, clouds, soft focus, Subtle Reflected Light, Community Building, Scandinavian Simplicity, Bustling Outdoor Marketplace with Vendors, People Walking Dogs, Benches, urban green space, Climbing Vines Creating a Natural Curtain, Cinematic Quality'

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Flux 1.1 Pro Image Generator
      </h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium">
            Enter your prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A beautiful sunset over mountains..."
            className="w-full p-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[100px]"
            disabled={loading}
          />
        </div>

        <button
          onClick={generateImage}
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="space-y-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-800">
              <Image
                src={imageUrl}
                alt={prompt}
                fill
                className="object-contain"
              />
            </div>
            <a
              href={imageUrl}
              download="generated-image.png"
              className="block text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
