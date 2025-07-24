import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, CheckCircle, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { ApiConfigManager, ImageProvider } from "@/services/apiConfig";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function ApiConfigPanel() {
  const { isAdmin } = useAuth();
  const [config] = useState(() => ApiConfigManager.getInstance());
  const [openaiKey, setOpenaiKey] = useState("");
  const [huggingfaceKey, setHuggingfaceKey] = useState("");
  const [imageProvider, setImageProvider] = useState<ImageProvider>("openai");
  const [centralApiKey, setCentralApiKey] = useState("");
  const [hasCentralConfig, setHasCentralConfig] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, [config]);

  const loadConfiguration = async () => {
    await config.refreshCentralConfig();
    setOpenaiKey(config.getOpenAIKey());
    setHuggingfaceKey(config.getHuggingFaceKey());
    setImageProvider(config.getImageProvider());
    setHasCentralConfig(config.hasCentralConfiguration());
  };

  const handleSaveOpenAI = () => {
    if (!openaiKey) {
      toast.error("Por favor, insira uma chave OpenAI válida");
      return;
    }
    config.setOpenAIKey(openaiKey);
    toast.success("🔑 Chave OpenAI salva com sucesso!");
  };

  const handleSaveHuggingFace = () => {
    if (!huggingfaceKey) {
      toast.error("Por favor, insira uma chave HuggingFace válida");
      return;
    }
    config.setHuggingFaceKey(huggingfaceKey);
    toast.success("🔑 Chave HuggingFace salva com sucesso!");
  };

  const handleProviderChange = (provider: ImageProvider) => {
    setImageProvider(provider);
    config.setImageProvider(provider);
    toast.success(`🔄 Provedor de imagem alterado para ${provider === 'openai' ? 'OpenAI' : 'HuggingFace'}`);
  };

  const handleSaveCentralConfig = async () => {
    if (!centralApiKey.trim()) {
      toast.error('Chave OpenAI é obrigatória');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-api-config', {
        body: { openaiKey: centralApiKey }
      });

      if (error) throw error;

      toast.success('Configuração central salva com sucesso!');
      await loadConfiguration();
    } catch (error) {
      console.error('Error saving central config:', error);
      toast.error('Erro ao salvar configuração central');
    }
  };

  const isOpenAIConfigured = openaiKey.length > 0;
  const isHuggingFaceConfigured = huggingfaceKey.length > 0;
  const isCurrentProviderConfigured = imageProvider === 'openai' ? isOpenAIConfigured : isHuggingFaceConfigured;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <div>
                  <CardTitle>Configuração Central - Admin</CardTitle>
                  <CardDescription>
                    Configure a chave OpenAI para todos os gestores
                  </CardDescription>
                </div>
              </div>
              <Badge variant={hasCentralConfig ? "default" : "secondary"}>
                {hasCentralConfig ? "Configurado" : "Não Configurado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="centralOpenAI">Chave OpenAI Central</Label>
              <div className="flex gap-2">
                <Input
                  id="centralOpenAI"
                  type="password"
                  placeholder="sk-..."
                  value={centralApiKey}
                  onChange={(e) => setCentralApiKey(e.target.value)}
                  className="bg-background border-border"
                />
                <Button onClick={handleSaveCentralConfig}>
                  Salvar Central
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta chave será usada por todos os gestores que não tiverem configuração própria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <div>
                <CardTitle>
                  Configuração de APIs {!isAdmin && hasCentralConfig && "(Central Ativa)"}
                </CardTitle>
                <CardDescription>
                  {hasCentralConfig && !isAdmin 
                    ? "Configuração central ativa - você pode usar o gerador imediatamente"
                    : "Configure as chaves de API para gerar conteúdo e imagens"
                  }
                </CardDescription>
              </div>
            </div>
            <Badge variant={config.isConfigured() ? "default" : "destructive"}>
              {config.isConfigured() ? "Configurado" : "Não Configurado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Geral */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {config.isConfigured() ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                Status: {config.isConfigured() ? "Configurado ✅" : "Pendente ❌"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.isConfigured() 
                ? "Todas as configurações necessárias estão definidas."
                : hasCentralConfig 
                  ? "Configuração central disponível. Você pode usar o gerador imediatamente."
                  : "Configure pelo menos a chave OpenAI e o provedor de imagem para começar."
              }
            </p>
          </div>

          {/* OpenAI Configuration */}
          {(!hasCentralConfig || isAdmin) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <Label className="text-base font-medium">
                  OpenAI API Key {hasCentralConfig && "(Opcional - substitui central)"}
                </Label>
                {isOpenAIConfigured && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha sua chave em: https://platform.openai.com/api-keys
                </p>
                <Button 
                  onClick={handleSaveOpenAI}
                  disabled={!openaiKey}
                  className="w-full"
                >
                  Salvar Chave OpenAI
                </Button>
              </div>
            </div>
          )}

          {/* Image Provider Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Provedor de Imagem</Label>
            <Select value={imageProvider} onValueChange={handleProviderChange}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI DALL-E 3 (Recomendado)</SelectItem>
                <SelectItem value="huggingface">HuggingFace FLUX (Alternativo)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              OpenAI DALL-E 3 oferece melhor qualidade, mas HuggingFace é mais rápido e gratuito.
            </p>
          </div>

          {/* HuggingFace Configuration */}
          {imageProvider === 'huggingface' && (!hasCentralConfig || isAdmin) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <Label className="text-base font-medium">HuggingFace API Key</Label>
                {isHuggingFaceConfigured && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="hf_..."
                  value={huggingfaceKey}
                  onChange={(e) => setHuggingfaceKey(e.target.value)}
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Obtenha sua chave em: https://huggingface.co/settings/tokens
                </p>
                <Button 
                  onClick={handleSaveHuggingFace}
                  disabled={!huggingfaceKey}
                  className="w-full"
                >
                  Salvar Chave HuggingFace
                </Button>
              </div>
            </div>
          )}

          {/* Current Configuration Summary */}
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Configuração Atual:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>
                • OpenAI: {isOpenAIConfigured ? "Configurado ✅" : "Não configurado ❌"}
                {hasCentralConfig && (
                  <span className="ml-2 text-xs">(Central disponível)</span>
                )}
              </div>
              <div>• HuggingFace: {isHuggingFaceConfigured ? "Configurado ✅" : "Não configurado ❌"}</div>
              <div>• Provedor de Imagem: {imageProvider === 'openai' ? 'OpenAI DALL-E 3' : 'HuggingFace FLUX'}</div>
              <div>• Status Geral: {config.isConfigured() ? "Pronto para usar ✅" : "Configuração incompleta ❌"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}