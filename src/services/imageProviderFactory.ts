import { GeneratedImage, OpenAIService } from './openai';
import { ApiConfigManager, ImageProvider } from './apiConfig';

export interface UnifiedImageParams {
  prompt: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'high';
  style?: 'vivid' | 'natural';
}

export interface ImageService {
  generateImage(params: UnifiedImageParams): Promise<GeneratedImage>;
}

class OpenAIImageService implements ImageService {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
  }

  async generateImage(params: UnifiedImageParams): Promise<GeneratedImage> {
    const size = params.width === 1792 || params.height === 1792 
      ? "1792x1024" 
      : params.width === 1024 && params.height === 1792 
      ? "1024x1792" 
      : "1024x1024";

    return this.openaiService.generateImage({
      prompt: params.prompt,
      size: size as any,
      quality: params.quality === 'high' ? 'hd' : 'standard',
      style: params.style || 'vivid',
    });
  }
}

class HuggingFaceImageService implements ImageService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: UnifiedImageParams): Promise<GeneratedImage> {
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: params.prompt,
          parameters: {
            width: params.width || 1024,
            height: params.height || 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      return {
        url: imageUrl,
        revisedPrompt: params.prompt,
      };
    } catch (error) {
      console.error('HuggingFace image generation error:', error);
      throw new Error('Falha ao gerar imagem com HuggingFace. Verifique sua chave API.');
    }
  }
}

export class ImageProviderFactory {
  static createService(provider: ImageProvider, config: ApiConfigManager): ImageService {
    switch (provider) {
      case 'openai':
        return new OpenAIImageService(config.getOpenAIKey());
      case 'huggingface':
        return new HuggingFaceImageService(config.getHuggingFaceKey());
      default:
        throw new Error(`Provedor de imagem não suportado: ${provider}`);
    }
  }
}