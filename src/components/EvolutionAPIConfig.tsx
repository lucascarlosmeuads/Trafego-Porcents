import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EvolutionConfig {
  id: string;
  enabled: boolean;
  server_url: string;
  instance_name: string;
  default_country_code: string;
  api_type: string;
  created_at: string;
  updated_at: string;
  base_url: string;
  endpoint_path: string;
}

export function EvolutionAPIConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [formData, setFormData] = useState({
    server_url: '',
    instance_name: '',
    default_country_code: '+55',
    enabled: true
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('waseller_dispatch_config')
        .select('*')
        .eq('api_type', 'evolution')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
        setFormData({
          server_url: data.server_url || '',
          instance_name: data.instance_name || '',
          default_country_code: data.default_country_code || '+55',
          enabled: data.enabled || false
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configuração da Evolution API",
        variant: "destructive",
      });
    }
  };

  const saveConfig = async () => {
    if (!formData.server_url || !formData.instance_name) {
      toast({
        title: "Campos obrigatórios",
        description: "URL do servidor e nome da instância são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const configData = {
        enabled: formData.enabled,
        server_url: formData.server_url,
        instance_name: formData.instance_name,
        default_country_code: formData.default_country_code,
        api_type: 'evolution',
        base_url: formData.server_url, // Required field
        endpoint_path: '/message/sendText', // Evolution API endpoint
        updated_at: new Date().toISOString()
      };

      if (config?.id) {
        // Update existing config
        const { error } = await supabase
          .from('waseller_dispatch_config')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase
          .from('waseller_dispatch_config')
          .insert({
            ...configData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API salva com sucesso!",
      });

      await loadConfig();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configuração: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!formData.server_url || !formData.instance_name) {
      toast({
        title: "Configuração incompleta",
        description: "Configure primeiro a URL do servidor e nome da instância",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Test with a sample lead ID - replace with actual test
      const { data, error } = await supabase.functions.invoke('evolution-send-message', {
        body: { 
          leadId: 'test',
          testMode: true 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Conexão bem-sucedida!",
          description: "Evolution API está funcionando corretamente",
        });
      } else {
        throw new Error(data?.error || 'Teste falhou');
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      toast({
        title: "Teste falhou",
        description: error.message || "Não foi possível conectar à Evolution API",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configuração Evolution API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, enabled: checked }))
            }
          />
          <Label htmlFor="enabled">API Habilitada</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server_url">URL do Servidor Evolution</Label>
          <Input
            id="server_url"
            placeholder="https://api.evolution.com"
            value={formData.server_url}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, server_url: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instance_name">Nome da Instância</Label>
          <Input
            id="instance_name"
            placeholder="minha-instancia"
            value={formData.instance_name}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, instance_name: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country_code">Código do País Padrão</Label>
          <Input
            id="country_code"
            placeholder="+55"
            value={formData.default_country_code}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, default_country_code: e.target.value }))
            }
          />
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={saveConfig} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testConnection}
            disabled={testing || !formData.enabled}
            className="flex-1"
          >
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
        </div>

        {config && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Status: {config.enabled ? '✅ Ativa' : '❌ Inativa'}
            </p>
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(config.updated_at).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}