import { GeneratedImage, OpenAIService } from './openai';
import { ApiConfigManager, ImageProvider } from './apiConfig';
import { RunwayImageService } from './runwayService';

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

class RunwayImageServiceAdapter implements ImageService {
  private runwayService: RunwayImageService;

  constructor(apiKey: string) {
    this.runwayService = new RunwayImageService(apiKey);
  }

  async generateImage(params: UnifiedImageParams): Promise<GeneratedImage> {
    return this.runwayService.generateImage(params);
  }
}

class RunwareImageService implements ImageService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: UnifiedImageParams): Promise<GeneratedImage> {
    try {
      // Runware API implementation
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            taskType: "authentication",
            apiKey: this.apiKey
          },
          {
            taskType: "imageInference",
            taskUUID: crypto.randomUUID(),
            positivePrompt: params.prompt,
            width: params.width || 1024,
            height: params.height || 1024,
            model: "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 1,
            scheduler: "FlowMatchEulerDiscreteScheduler"
          }
        ])
      });

      if (!response.ok) {
        throw new Error(`Runware API error: ${response.statusText}`);
      }

      const data = await response.json();
      const imageResult = data.data?.find((item: any) => item.taskType === 'imageInference');
      
      if (!imageResult?.imageURL) {
        throw new Error('Nenhuma imagem retornada pela API Runware');
      }

      return {
        url: imageResult.imageURL,
        revisedPrompt: params.prompt,
      };
    } catch (error) {
      console.error('Runware image generation error:', error);
      throw new Error('Falha ao gerar imagem com Runware. Verifique sua chave API.');
    }
  }
}

export class ImageProviderFactory {
  static createService(provider: ImageProvider, config: ApiConfigManager): ImageService {
    const apiKey = config.getApiKeyForProvider(provider);
    
    if (!apiKey) {
      // Fallback para chaves legacy
      switch (provider) {
        case 'openai':
          const openaiKey = config.getOpenAIKey();
          if (!openaiKey) throw new Error('Chave OpenAI não configurada');
          return new OpenAIImageService(openaiKey);
        case 'huggingface':
          const hfKey = config.getHuggingFaceKey();
          if (!hfKey) throw new Error('Chave HuggingFace não configurada');
          return new HuggingFaceImageService(hfKey);
        default:
          throw new Error(`Chave API não encontrada para o provedor ${provider}`);
      }
    }

    switch (provider) {
      case 'openai':
        return new OpenAIImageService(apiKey);
      case 'huggingface':
        return new HuggingFaceImageService(apiKey);
      case 'runway':
        return new RunwayImageServiceAdapter(apiKey);
      case 'runware':
        return new RunwareImageService(apiKey);
      case 'midjourney':
      case 'replicate':
        throw new Error(`Provedor ${provider} não implementado ainda`);
      default:
        throw new Error(`Provedor de imagem não suportado: ${provider}`);
    }
  }

  static hasAnyImageProviderConfigured(config: ApiConfigManager): boolean {
    return config.hasAnyImageProviderConfigured();
  }

  static getConfiguredProviders(config: ApiConfigManager): ImageProvider[] {
    const configurations = config.getConfigurationsByType('image');
    const providers: ImageProvider[] = configurations.map(c => c.provider_name as ImageProvider);
    
    // Add legacy providers if available
    if (config.getOpenAIKey() && !providers.includes('openai')) {
      providers.push('openai');
    }
    if (config.getHuggingFaceKey() && !providers.includes('huggingface')) {
      providers.push('huggingface');
    }
    
    return providers;
  }

  static getDefaultImageService(config: ApiConfigManager): ImageService | null {
    const activeProvider = config.getActiveImageProvider();
    if (!activeProvider) return null;
    
    try {
      return this.createService(activeProvider as ImageProvider, config);
    } catch {
      return null;
    }
  }
}