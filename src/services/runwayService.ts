import { GeneratedImage } from './openai';
import { UnifiedImageParams } from './imageProviderFactory';

export interface RunwayImageParams {
  prompt: string;
  width?: number;
  height?: number;
  style?: string;
  model?: string;
}

export class RunwayImageService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: UnifiedImageParams): Promise<GeneratedImage> {
    try {
      // Runway ML API call for image generation
      const response = await fetch('https://api.runwayml.com/v1/image_generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          width: params.width || 1024,
          height: params.height || 1024,
          model: 'gen-3-alpha-turbo', // Runway's default model
          style: params.style || 'photorealistic',
          quality: params.quality || 'standard'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Runway API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Runway usually returns a task ID first, then we need to poll for results
      if (data.id) {
        // Poll for completion
        const imageUrl = await this.pollForCompletion(data.id);
        return {
          url: imageUrl,
          revisedPrompt: params.prompt,
        };
      }

      // If direct URL is returned
      if (data.url || data.image_url) {
        return {
          url: data.url || data.image_url,
          revisedPrompt: params.prompt,
        };
      }

      throw new Error('Resposta inesperada da API Runway');

    } catch (error) {
      console.error('Runway image generation error:', error);
      if (error instanceof Error) {
        throw new Error(`Falha ao gerar imagem com Runway: ${error.message}`);
      }
      throw new Error('Falha ao gerar imagem com Runway. Verifique sua chave API.');
    }
  }

  private async pollForCompletion(taskId: string, maxAttempts: number = 30): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'completed' && data.output?.url) {
          return data.output.url;
        }
        
        if (data.status === 'failed') {
          throw new Error(`Geração falhou: ${data.error || 'Erro desconhecido'}`);
        }
        
        // Wait before next poll (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Timeout aguardando geração da imagem');
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await fetch('https://api.runwayml.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão Runway estabelecida com sucesso',
          details: { 
            user_id: data.id || 'unknown',
            api_status: 'active'
          }
        };
      } else {
        return {
          success: false,
          message: 'Falha na autenticação Runway',
          details: { 
            status: response.status,
            error: 'Chave API inválida ou sem permissões'
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro de conexão com Runway',
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
      };
    }
  }
}