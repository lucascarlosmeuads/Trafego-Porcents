import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, TestTube, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { ApiConfigManager, type ApiConfiguration, type ImageProvider, type TextProvider } from "@/services/apiConfig";

interface ProviderConfig {
  name: string;
  type: 'text' | 'image';
  displayName: string;
  description: string;
  isImplemented: boolean;
}

const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    name: 'openai',
    type: 'text',
    displayName: 'OpenAI',
    description: 'Para análise de documentos e geração de texto',
    isImplemented: true
  },
  {
    name: 'claude',
    type: 'text',
    displayName: 'Claude (Anthropic)',
    description: 'Análise avançada de texto (em breve)',
    isImplemented: false
  },
  {
    name: 'gemini',
    type: 'text',
    displayName: 'Gemini (Google)',
    description: 'Análise multimodal (em breve)',
    isImplemented: false
  },
  {
    name: 'runway',
    type: 'image',
    displayName: 'Runway AI',
    description: 'Geração de imagens de alta qualidade (Recomendado)',
    isImplemented: true
  },
  {
    name: 'openai',
    type: 'image',
    displayName: 'OpenAI DALL-E',
    description: 'Geração de imagens criativas',
    isImplemented: true
  },
  {
    name: 'runware',
    type: 'image',
    displayName: 'Runware',
    description: 'Geração rápida de imagens',
    isImplemented: true
  },
  {
    name: 'huggingface',
    type: 'image',
    displayName: 'HuggingFace',
    description: 'Modelos open source',
    isImplemented: true
  }
];

export default function MultiProviderConfigPanel() {
  const [config] = useState(() => ApiConfigManager.getInstance());
  const [configurations, setConfigurations] = useState<ApiConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  
  // Form state
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'text' | 'image'>('image');
  const [apiKey, setApiKey] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    await config.refreshConfigurations();
    setConfigurations(config.getConfigurations());
    setLoading(false);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedProvider || !apiKey.trim()) {
      toast.error('Selecione um provedor e insira a chave API');
      return;
    }

    setSaving(true);
    try {
      const success = await config.saveConfiguration({
        provider_name: selectedProvider,
        provider_type: selectedType,
        api_key: apiKey.trim(),
        is_active: true,
        is_default: isDefault
      });

      if (success) {
        toast.success('Configuração salva com sucesso!');
        setApiKey('');
        setSelectedProvider('');
        setIsDefault(false);
        await loadConfigurations();
      } else {
        toast.error('Erro ao salvar configuração');
      }
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerName: string, providerType: string, apiKey: string) => {
    setTesting(providerName);
    try {
      const result = await config.testConnection(providerName, providerType, apiKey);
      
      if (result.success) {
        toast.success(`✅ ${result.message}`);
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTesting(null);
    }
  };

  const getProviderConfig = (name: string, type: string): ProviderConfig | undefined => {
    return AVAILABLE_PROVIDERS.find(p => p.name === name && p.type === type);
  };

  const getConfigurationsByType = (type: 'text' | 'image') => {
    return configurations.filter(c => c.provider_type === type);
  };

  const getStatusBadge = (config: ApiConfiguration) => {
    const isActive = config.is_active;
    const isDefault = config.is_default;
    
    if (!isActive) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    
    return (
      <div className="flex gap-1">
        <Badge variant="default">Ativo</Badge>
        {isDefault && <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Star className="h-3 w-3 mr-1" />Padrão</Badge>}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando configurações...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Configuração de Provedores de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as 'text' | 'image')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Provedores de Texto</TabsTrigger>
              <TabsTrigger value="image">Provedores de Imagem</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-medium">Provedores de Análise de Texto</h3>
                
                {/* Existing text configurations */}
                {getConfigurationsByType('text').map((config) => {
                  const providerConfig = getProviderConfig(config.provider_name, 'text');
                  return (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{providerConfig?.displayName || config.provider_name}</h4>
                          {getStatusBadge(config)}
                        </div>
                        <p className="text-sm text-muted-foreground">{providerConfig?.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(config.provider_name, config.provider_type, config.api_key)}
                        disabled={testing === config.provider_name}
                      >
                        {testing === config.provider_name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}

                {/* Add new text provider */}
                <div className="p-4 border rounded-lg border-dashed">
                  <h4 className="font-medium mb-4">Adicionar Novo Provedor</h4>
                  <div className="grid gap-4">
                    <div>
                      <Label>Provedor</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_PROVIDERS.filter(p => p.type === 'text').map((provider) => (
                            <SelectItem 
                              key={provider.name} 
                              value={provider.name}
                              disabled={!provider.isImplemented}
                            >
                              {provider.displayName} {!provider.isImplemented && '(Em breve)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Chave API</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua chave API aqui"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                      />
                      <Label htmlFor="isDefault">Definir como padrão</Label>
                    </div>
                    <Button onClick={handleSaveConfiguration} disabled={saving || !selectedProvider || !apiKey.trim()}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Adicionar Provedor
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-medium">Provedores de Geração de Imagens</h3>
                
                {/* Existing image configurations */}
                {getConfigurationsByType('image').map((config) => {
                  const providerConfig = getProviderConfig(config.provider_name, 'image');
                  return (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{providerConfig?.displayName || config.provider_name}</h4>
                          {getStatusBadge(config)}
                          {config.provider_name === 'runway' && <Badge variant="outline" className="text-green-600 border-green-600">Recomendado</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{providerConfig?.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(config.provider_name, config.provider_type, config.api_key)}
                        disabled={testing === config.provider_name}
                      >
                        {testing === config.provider_name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}

                {/* Add new image provider */}
                <div className="p-4 border rounded-lg border-dashed">
                  <h4 className="font-medium mb-4">Adicionar Novo Provedor</h4>
                  <div className="grid gap-4">
                    <div>
                      <Label>Provedor</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_PROVIDERS.filter(p => p.type === 'image').map((provider) => (
                            <SelectItem 
                              key={`${provider.name}-image`} 
                              value={provider.name}
                              disabled={!provider.isImplemented}
                            >
                              {provider.displayName} {!provider.isImplemented && '(Em breve)'}
                              {provider.name === 'runway' && ' (Recomendado)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Chave API</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua chave API aqui"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefaultImage"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                      />
                      <Label htmlFor="isDefaultImage">Definir como padrão</Label>
                    </div>
                    <Button onClick={handleSaveConfiguration} disabled={saving || !selectedProvider || !apiKey.trim()}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Adicionar Provedor
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Provedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Análise de Texto</h4>
              <div className="flex items-center gap-2">
                {config.hasAnyTextProviderConfigured() ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Configurado</span>
                    <Badge variant="outline">{config.getActiveTextProvider()}</Badge>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Não configurado</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Geração de Imagens</h4>
              <div className="flex items-center gap-2">
                {config.hasAnyImageProviderConfigured() ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Configurado</span>
                    <Badge variant="outline">{config.getActiveImageProvider()}</Badge>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Não configurado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
