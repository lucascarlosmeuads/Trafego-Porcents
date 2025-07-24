export type ImageProvider = 'openai' | 'huggingface';

export class ApiConfigManager {
  private static instance: ApiConfigManager;
  private openaiKey: string = '';
  private huggingfaceKey: string = '';
  private imageProvider: ImageProvider = 'openai';

  private constructor() {
    this.loadFromLocalStorage();
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

  setOpenAIKey(key: string) {
    this.openaiKey = key;
    this.saveToLocalStorage();
  }

  getOpenAIKey(): string {
    return this.openaiKey;
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
    return this.openaiKey.length > 0 && (
      this.imageProvider === 'openai' || 
      (this.imageProvider === 'huggingface' && this.huggingfaceKey.length > 0)
    );
  }
}