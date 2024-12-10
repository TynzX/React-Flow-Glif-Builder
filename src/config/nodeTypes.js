export const nodeTypes = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'Generate text using various language models',
    icon: '💭',
    inputs: 1,
    outputs: 1,
    properties: [
      { 
        name: 'model',
        type: 'select',
        options: ['ChatGPT 3.5', 'ChatGPT 4', 'Claude', 'Claude 2', 'Haiku', 'GPT-3.5 Sonnet'],
        default: 'ChatGPT 3.5'
      },
      { name: 'prompt', type: 'text', required: true },
      { name: 'temperature', type: 'range', min: 0, max: 1, step: 0.1, default: 0.7 },
      { name: 'maxTokens', type: 'number', min: 1, max: 4000, default: 2000 },
      { name: 'topP', type: 'range', min: 0, max: 1, step: 0.1, default: 0.9 },
      { name: 'systemMessage', type: 'text' }
    ],
  },
  {
    id: 'image-generation',
    name: 'Text to Image Generation',
    description: 'Generate images from text descriptions',
    icon: '🎨',
    inputs: 1,
    outputs: 1,
    properties: [
      {
        name: 'model',
        type: 'select',
        options: ['Leonardo', 'Flux LORA'],
        default: 'Leonardo'
      },
      { name: 'prompt', type: 'text', required: true },
      { name: 'negativePrompt', type: 'text' },
      { 
        name: 'ratio',
        type: 'select',
        options: ['1:1', '16:9', '4:3', '3:4', '9:16'],
        default: '1:1'
      },
      {
        name: 'resolution',
        type: 'select',
        options: ['512x512', '768x768', '1024x1024'],
        default: '512x512'
      },
      {
        name: 'stylePreset',
        type: 'select',
        options: ['Cinematic', 'Digital Art', 'Anime', 'Photography', 'Abstract'],
        default: 'Digital Art'
      },
      { name: 'numImages', type: 'number', min: 1, max: 4, default: 1 },
      { name: 'guidanceScale', type: 'range', min: 1, max: 20, default: 7 }
    ],
  },
  {
    id: 'video-generation',
    name: 'Text/Image to Video',
    description: 'Generate videos from text or images',
    icon: '🎥',
    inputs: 1,
    outputs: 1,
    properties: [
      { name: 'prompt', type: 'text' },
      { name: 'imageUrl', type: 'text' },
      {
        name: 'ratio',
        type: 'select',
        options: ['1:1', '16:9', '4:3', '9:16'],
        default: '16:9'
      },
      { name: 'length', type: 'number', min: 1, max: 30, default: 5 },
      {
        name: 'fps',
        type: 'select',
        options: ['24', '30', '60'],
        default: '30'
      },
      {
        name: 'quality',
        type: 'select',
        options: ['Standard', 'High'],
        default: 'Standard'
      }
    ],
  },
  {
    id: 'audio-generation',
    name: 'Text to Audio',
    description: 'Generate audio from text using Eleven Labs',
    icon: '🔊',
    inputs: 1,
    outputs: 1,
    properties: [
      { name: 'text', type: 'text', required: true },
      { name: 'voice', type: 'string' },
      { name: 'stability', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5 },
      { name: 'similarityBoost', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5 },
      { name: 'style', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5 },
      { name: 'speakerBoost', type: 'boolean', default: false },
      {
        name: 'model',
        type: 'select',
        options: ['Multilingual v1', 'Multilingual v2'],
        default: 'Multilingual v1'
      },
      {
        name: 'outputFormat',
        type: 'select',
        options: ['MP3', 'WAV'],
        default: 'MP3'
      }
    ],
  }
];