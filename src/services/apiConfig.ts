export type ImageProvider = 'openai' | 'huggingface';

export class ApiConfigManager {
  private static instance: ApiConfigManager;
  private openaiKey: string = '';
  private huggingfaceKey: string = '';
  private imageProvider: ImageProvider = 'openai';
  private centralApiKey: string = '';
  private hasCentralConfig: boolean = false;

  private constructor() {
    this.loadFromLocalStorage();
    this.loadCentralConfig();
  }

  static getInstance(): ApiConfigManager {
    if (!ApiConfigManager.instance) {
      ApiConfigManager.instance = new ApiConfigManager();
    }
    return ApiConfigManager.instance;
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      this.openaiKey = localStorage.getItem('openai_key') || '';
      this.huggingfaceKey = localStorage.getItem('huggingface_key') || '';
      this.imageProvider = (localStorage.getItem('image_provider') as ImageProvider) || 'openai';
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_key', this.openaiKey);
      localStorage.setItem('huggingface_key', this.huggingfaceKey);
      localStorage.setItem('image_provider', this.imageProvider);
    }
  }

  private async loadCentralConfig() {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('get-central-api-config');
      
      if (!error && data) {
        this.centralApiKey = data.apiKey || '';
        this.hasCentralConfig = data.hasConfig || false;
        console.log('Central config loaded:', { hasConfig: this.hasCentralConfig });
      }
    } catch (error) {
      console.log('Could not load central config:', error);
      this.hasCentralConfig = false;
    }
  }

  setOpenAIKey(key: string) {
    this.openaiKey = key;
    this.saveToLocalStorage();
  }

  getOpenAIKey(): string {
    // Priorizar chave local, depois chave central
    return this.openaiKey || this.centralApiKey;
  }

  getCentralApiKey(): string {
    return this.centralApiKey;
  }

  hasCentralConfiguration(): boolean {
    return this.hasCentralConfig;
  }

  setHuggingFaceKey(key: string) {
    this.huggingfaceKey = key;
    this.saveToLocalStorage();
  }

  getHuggingFaceKey(): string {
    return this.huggingfaceKey;
  }

  setImageProvider(provider: ImageProvider) {
    this.imageProvider = provider;
    this.saveToLocalStorage();
  }

  getImageProvider(): ImageProvider {
    return this.imageProvider;
  }

  isConfigured(): boolean {
    const hasOpenAIKey = this.openaiKey.length > 0 || this.centralApiKey.length > 0;
    return hasOpenAIKey && (
      this.imageProvider === 'openai' || 
      (this.imageProvider === 'huggingface' && this.huggingfaceKey.length > 0)
    );
  }

  async refreshCentralConfig(): Promise<void> {
    await this.loadCentralConfig();
  }
}