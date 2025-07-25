import { OpenAIService, type BusinessAnalysis, type MultipleAdOptions } from './openai';
import { ApiConfigManager, type TextProvider } from './apiConfig';

export interface TextAnalysisParams {
  documentText: string;
}

export interface TextService {
  analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis>;
  generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions>;
}

class OpenAITextService implements TextService {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
  }

  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    return this.openaiService.analyzeBusinessDocument(documentText);
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    return this.openaiService.generateMultipleAdOptions(analysis);
  }
}

class ClaudeTextService implements TextService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    // TODO: Implementar Claude API
    throw new Error('Claude provider não implementado ainda');
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    // TODO: Implementar Claude API
    throw new Error('Claude provider não implementado ainda');
  }
}

class GeminiTextService implements TextService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    // TODO: Implementar Gemini API
    throw new Error('Gemini provider não implementado ainda');
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    // TODO: Implementar Gemini API
    throw new Error('Gemini provider não implementado ainda');
  }
}

export class TextProviderFactory {
  static createService(provider: TextProvider, config: ApiConfigManager): TextService {
    const apiKey = config.getApiKeyForProvider(provider);
    
    if (!apiKey) {
      throw new Error(`Chave API não encontrada para o provedor ${provider}`);
    }

    switch (provider) {
      case 'openai':
        return new OpenAITextService(apiKey);
      case 'claude':
        return new ClaudeTextService(apiKey);
      case 'gemini':
        return new GeminiTextService(apiKey);
      default:
        throw new Error(`Provedor de texto não suportado: ${provider}`);
    }
  }

  static hasAnyTextProviderConfigured(config: ApiConfigManager): boolean {
    return config.hasAnyTextProviderConfigured();
  }

  static getConfiguredProviders(config: ApiConfigManager): TextProvider[] {
    const configurations = config.getConfigurationsByType('text');
    const providers: TextProvider[] = configurations.map(c => c.provider_name as TextProvider);
    
    // Add legacy OpenAI if available
    if (config.getOpenAIKey() && !providers.includes('openai')) {
      providers.push('openai');
    }
    
    return providers;
  }

  static getDefaultTextService(config: ApiConfigManager): TextService | null {
    const activeProvider = config.getActiveTextProvider();
    if (!activeProvider) return null;
    
    try {
      return this.createService(activeProvider as TextProvider, config);
    } catch {
      return null;
    }
  }
}