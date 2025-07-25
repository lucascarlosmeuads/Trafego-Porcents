export type ImageProvider = 'openai' | 'huggingface' | 'runway' | 'runware' | 'midjourney' | 'replicate';
export type TextProvider = 'openai' | 'claude' | 'gemini';

export interface ApiConfiguration {
  id: string;
  provider_name: string;
  provider_type: 'text' | 'image';
  api_key: string;
  is_active: boolean;
  is_default: boolean;
  email_usuario: string;
  created_at: string;
  updated_at: string;
}

export class ApiConfigManager {
  private static instance: ApiConfigManager;
  private configurations: ApiConfiguration[] = [];
  private loadingConfigurations: boolean = false;
  
  // Legacy support
  private openaiKey: string = '';
  private huggingfaceKey: string = '';
  private imageProvider: ImageProvider = 'runway';
  private centralApiKey: string = '';
  private hasCentralConfig: boolean = false;

  private constructor() {
    this.loadFromLocalStorage();
    this.loadCentralConfig();
    this.loadConfigurations();
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

  // Novos métodos para múltiplos provedores
  private async loadConfigurations(): Promise<void> {
    if (this.loadingConfigurations) return;
    
    try {
      this.loadingConfigurations = true;
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('manage-api-keys');
      
      if (!error && data?.configurations) {
        this.configurations = data.configurations;
      }
    } catch (error) {
      console.log('Could not load API configurations:', error);
    } finally {
      this.loadingConfigurations = false;
    }
  }

  async saveConfiguration(config: Omit<ApiConfiguration, 'id' | 'email_usuario' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('manage-api-keys', {
        body: config
      });
      
      if (!error) {
        await this.loadConfigurations();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving configuration:', error);
      return false;
    }
  }

  async testConnection(providerName: string, providerType: string, apiKey: string): Promise<any> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: {
          provider_name: providerName,
          provider_type: providerType,
          api_key: apiKey
        }
      });
      
      return data || { success: false, message: 'Erro desconhecido' };
    } catch (error) {
      console.error('Error testing connection:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }

  getConfigurations(): ApiConfiguration[] {
    return this.configurations;
  }

  getConfigurationsByType(type: 'text' | 'image'): ApiConfiguration[] {
    return this.configurations.filter(config => 
      config.provider_type === type && config.is_active
    );
  }

  getDefaultConfiguration(type: 'text' | 'image'): ApiConfiguration | null {
    return this.configurations.find(config => 
      config.provider_type === type && config.is_default && config.is_active
    ) || null;
  }

  getConfigurationByProvider(providerName: string): ApiConfiguration | null {
    return this.configurations.find(config => 
      config.provider_name === providerName && config.is_active
    ) || null;
  }

  hasAnyTextProviderConfigured(): boolean {
    const textConfigs = this.getConfigurationsByType('text');
    return textConfigs.length > 0 || this.getOpenAIKey().length > 0;
  }

  hasAnyImageProviderConfigured(): boolean {
    const imageConfigs = this.getConfigurationsByType('image');
    return imageConfigs.length > 0 || this.getHuggingFaceKey().length > 0;
  }

  getActiveTextProvider(): string {
    const defaultConfig = this.getDefaultConfiguration('text');
    if (defaultConfig) return defaultConfig.provider_name;
    
    const textConfigs = this.getConfigurationsByType('text');
    if (textConfigs.length > 0) return textConfigs[0].provider_name;
    
    return this.getOpenAIKey() ? 'openai' : '';
  }

  getActiveImageProvider(): string {
    const defaultConfig = this.getDefaultConfiguration('image');
    if (defaultConfig) return defaultConfig.provider_name;
    
    const imageConfigs = this.getConfigurationsByType('image');
    if (imageConfigs.length > 0) return imageConfigs[0].provider_name;
    
    return this.getImageProvider();
  }

  getApiKeyForProvider(providerName: string): string {
    const config = this.getConfigurationByProvider(providerName);
    if (config) return config.api_key;
    
    // Legacy fallback
    switch (providerName) {
      case 'openai':
        return this.getOpenAIKey();
      case 'huggingface':
        return this.getHuggingFaceKey();
      default:
        return '';
    }
  }

  async refreshConfigurations(): Promise<void> {
    await this.loadConfigurations();
  }
}