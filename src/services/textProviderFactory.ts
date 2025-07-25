import { toast } from 'sonner';
import { ApiConfigManager } from './apiConfig';
import { OpenAIService } from './openai';
import type { BusinessAnalysis, AdPromptElements, MultipleAdOptions } from './openai';

export type TextProvider = 'openai' | 'claude' | 'gemini';

export interface UnifiedTextParams {
  documentText?: string;
  businessAnalysis?: BusinessAnalysis;
}

export interface TextProviderInterface {
  analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis>;
  generateAdPrompt(analysis: BusinessAnalysis): Promise<AdPromptElements>;
  generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions>;
  isConfigured(): boolean;
  getProviderName(): string;
}

// OpenAI Text Provider
class OpenAITextProvider implements TextProviderInterface {
  private getService(): OpenAIService {
    const apiManager = ApiConfigManager.getInstance();
    const apiKey = apiManager.getOpenAIKey();
    if (!apiKey) {
      throw new Error('OpenAI não configurado. Configure a chave API nas configurações.');
    }
    return new OpenAIService(apiKey);
  }

  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    const service = this.getService();
    return service.analyzeBusinessDocument(documentText);
  }

  async generateAdPrompt(analysis: BusinessAnalysis): Promise<AdPromptElements> {
    const service = this.getService();
    return service.generateAdPrompt(analysis);
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    const service = this.getService();
    return service.generateMultipleAdOptions(analysis);
  }

  isConfigured(): boolean {
    const apiManager = ApiConfigManager.getInstance();
    return apiManager.getOpenAIKey().length > 0;
  }

  getProviderName(): string {
    return 'OpenAI GPT-4';
  }
}

// Placeholder providers for future implementation
class ClaudeTextProvider implements TextProviderInterface {
  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    throw new Error('Claude provider not implemented yet');
  }

  async generateAdPrompt(analysis: BusinessAnalysis): Promise<AdPromptElements> {
    throw new Error('Claude provider not implemented yet');
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    throw new Error('Claude provider not implemented yet');
  }

  isConfigured(): boolean {
    return false;
  }

  getProviderName(): string {
    return 'Claude (Em breve)';
  }
}

class GeminiTextProvider implements TextProviderInterface {
  async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    throw new Error('Gemini provider not implemented yet');
  }

  async generateAdPrompt(analysis: BusinessAnalysis): Promise<AdPromptElements> {
    throw new Error('Gemini provider not implemented yet');
  }

  async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    throw new Error('Gemini provider not implemented yet');
  }

  isConfigured(): boolean {
    return false;
  }

  getProviderName(): string {
    return 'Gemini (Em breve)';
  }
}

export class TextProviderFactory {
  private static currentProvider: TextProvider = 'openai';

  private static getProvider(provider: TextProvider): TextProviderInterface {
    switch (provider) {
      case 'openai':
        return new OpenAITextProvider();
      case 'claude':
        return new ClaudeTextProvider();
      case 'gemini':
        return new GeminiTextProvider();
      default:
        throw new Error(`Provedor de texto não suportado: ${provider}`);
    }
  }

  static setCurrentProvider(provider: TextProvider): void {
    this.currentProvider = provider;
  }

  static getCurrentProvider(): TextProvider {
    return this.currentProvider;
  }

  static async analyzeBusinessDocument(documentText: string): Promise<BusinessAnalysis> {
    const provider = this.getProvider(this.currentProvider);
    return provider.analyzeBusinessDocument(documentText);
  }

  static async generateAdPrompt(analysis: BusinessAnalysis): Promise<AdPromptElements> {
    const provider = this.getProvider(this.currentProvider);
    return provider.generateAdPrompt(analysis);
  }

  static async generateMultipleAdOptions(analysis: BusinessAnalysis): Promise<MultipleAdOptions> {
    const provider = this.getProvider(this.currentProvider);
    return provider.generateMultipleAdOptions(analysis);
  }

  static hasAnyTextProviderConfigured(): boolean {
    const providers: TextProvider[] = ['openai', 'claude', 'gemini'];
    return providers.some(providerType => {
      const provider = this.getProvider(providerType);
      return provider.isConfigured();
    });
  }

  static getConfiguredProviders(): { provider: TextProvider; name: string; isConfigured: boolean }[] {
    const providers: TextProvider[] = ['openai', 'claude', 'gemini'];
    return providers.map(providerType => {
      const provider = this.getProvider(providerType);
      return {
        provider: providerType,
        name: provider.getProviderName(),
        isConfigured: provider.isConfigured()
      };
    });
  }

  static getActiveProviderName(): string {
    const provider = this.getProvider(this.currentProvider);
    return provider.getProviderName();
  }
}