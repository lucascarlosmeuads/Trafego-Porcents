import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Key, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ApiConfigManager, ImageProvider } from "@/services/apiConfig";

export default function ApiConfigPanel() {
  const [config] = useState(() => ApiConfigManager.getInstance());
  const [openaiKey, setOpenaiKey] = useState("");
  const [huggingfaceKey, setHuggingfaceKey] = useState("");
  const [imageProvider, setImageProvider] = useState<ImageProvider>("openai");

  useEffect(() => {
    setOpenaiKey(config.getOpenAIKey());
    setHuggingfaceKey(config.getHuggingFaceKey());
    setImageProvider(config.getImageProvider());
  }, [config]);

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

  const isOpenAIConfigured = openaiKey.length > 0;
  const isHuggingFaceConfigured = huggingfaceKey.length > 0;
  const isCurrentProviderConfigured = imageProvider === 'openai' ? isOpenAIConfigured : isHuggingFaceConfigured;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ⚙️ Configurações de API
          </CardTitle>
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
                : "Configure pelo menos a chave OpenAI e o provedor de imagem para começar."
              }
            </p>
          </div>

          {/* OpenAI Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <Label className="text-base font-medium">OpenAI API Key</Label>
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
          {imageProvider === 'huggingface' && (
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
              <div>• OpenAI: {isOpenAIConfigured ? "Configurado ✅" : "Não configurado ❌"}</div>
              <div>• HuggingFace: {isHuggingFaceConfigured ? "Configurado ✅" : "Não configurado ❌"}</div>
              <div>• Provedor de Imagem: {imageProvider === 'openai' ? 'OpenAI DALL-E 3' : 'HuggingFace FLUX'}</div>
              <div>• Status Geral: {isCurrentProviderConfigured ? "Pronto para usar ✅" : "Configuração incompleta ❌"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}