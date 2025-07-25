export type ImageProvider = 'openai' | 'huggingface' | 'runway';

export class ApiConfigManager {
  private static instance: ApiConfigManager;
  private openaiKey: string = '';
  private huggingfaceKey: string = '';
  private runwayKey: string = '';
  private imageProvider: ImageProvider = 'openai';
  private centralApiKey: string = '';
  private hasCentralConfig: boolean = false;

  private constructor() {
    this.loadFromLocalStorage();
    this.loadCentralConfig();
    this.loadFromDatabase();
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
      this.runwayKey = localStorage.getItem('runway_key') || '';
      this.imageProvider = (localStorage.getItem('image_provider') as ImageProvider) || 'openai';
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_key', this.openaiKey);
      localStorage.setItem('huggingface_key', this.huggingfaceKey);
      localStorage.setItem('runway_key', this.runwayKey);
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

  private async loadFromDatabase() {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('api_providers_config')
        .select('*')
        .single();
      
      if (!error && data) {
        // Preserve original keys if they exist, only update if database has longer keys
        if (data.openai_api_key && data.openai_api_key.length > this.openaiKey.length) {
          this.openaiKey = data.openai_api_key;
        }
        if (data.runway_api_key && data.runway_api_key.length > this.runwayKey.length) {
          this.runwayKey = data.runway_api_key;
        }
        this.imageProvider = (data.image_provider as ImageProvider) || this.imageProvider;
        console.log('Database config loaded:', {
          openaiKeyLength: data.openai_api_key?.length || 0,
          runwayKeyLength: data.runway_api_key?.length || 0,
          imageProvider: data.image_provider
        });
      }
    } catch (error) {
      console.log('Could not load database config:', error);
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

  setRunwayKey(key: string) {
    this.runwayKey = key;
    this.saveToLocalStorage();
  }

  getRunwayKey(): string {
    return this.runwayKey;
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
      (this.imageProvider === 'huggingface' && this.huggingfaceKey.length > 0) ||
      (this.imageProvider === 'runway' && this.runwayKey.length > 0)
    );
  }

  async saveToDatabase(openaiKey: string, runwayKey: string, imageProvider: ImageProvider): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log('Saving API config to database:', {
        openaiKeyLength: openaiKey.length,
        runwayKeyLength: runwayKey.length,
        imageProvider
      });
      
      const { data, error } = await supabase.functions.invoke('save-api-config', {
        body: {
          openaiApiKey: openaiKey,
          runwayApiKey: runwayKey,
          imageProvider: imageProvider
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('API config saved successfully:', data);
      
      // Update local state only after successful save
      this.openaiKey = openaiKey;
      this.runwayKey = runwayKey;
      this.imageProvider = imageProvider;
      this.saveToLocalStorage();
      
      // Reload from database to verify
      await this.loadFromDatabase();
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  }

  async refreshCentralConfig(): Promise<void> {
    await this.loadCentralConfig();
  }
}