import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EvolutionAPITester } from "./EvolutionAPITester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error' | 'checking'>('checking')
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    // Verificar status da conexão quando o componente carrega
    if (config?.enabled && config?.server_url && config?.instance_name) {
      checkConnectionStatus()
    }
  }, [config?.enabled, config?.server_url, config?.instance_name])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('waseller_dispatch_config')
        .select('*')
        .eq('api_type', 'evolution')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configuração:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a configuração",
          variant: "destructive",
        });
        return;
      }

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
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const saveConfig = async () => {
    if (!formData.server_url || !formData.instance_name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const configData = {
        api_type: 'evolution',
        base_url: formData.server_url,
        server_url: formData.server_url,
        endpoint_path: '/message/sendText',
        instance_name: formData.instance_name,
        default_country_code: formData.default_country_code,
        enabled: formData.enabled,
      };

      let result;
      if (config?.id) {
        result = await supabase
          .from('waseller_dispatch_config')
          .update(configData)
          .eq('id', config.id);
      } else {
        result = await supabase
          .from('waseller_dispatch_config')
          .insert([configData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Sucesso!",
        description: "Configuração salva com sucesso",
      });
      
      await loadConfig();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    setConnectionStatus('checking')
    try {
      const { data, error } = await supabase.functions.invoke('evolution-check-connection')

      if (error) {
        console.error('Erro ao verificar status:', error)
        setConnectionStatus('error')
        return
      }

      if (data?.success) {
        setConnectionStatus(data.status)
      } else {
        setConnectionStatus('error')
      }
    } catch (err: any) {
      console.error('Erro ao verificar status:', err)
      setConnectionStatus('error')
    }
  }

  const connectInstance = async () => {
    setConnectionStatus('connecting')
    try {
      const { data, error } = await supabase.functions.invoke('evolution-connect-instance')

      if (error) {
        console.error('Erro ao conectar:', error)
        toast({
          title: "Erro ao conectar",
          description: error.message || "Erro desconhecido",
          variant: "destructive"
        })
        setConnectionStatus('error')
        return
      }

      if (data?.success) {
        // Se retornou QR code, exibir modal
        if (data.data?.qrcode || data.data?.qr) {
          setQrCodeData(data.data.qrcode || data.data.qr)
          setShowQrModal(true)
          setConnectionStatus('connecting')
          
          toast({
            title: "QR Code gerado",
            description: "Escaneie o QR Code com seu WhatsApp para conectar",
          })
          
          // Verificar status periodicamente até conectar
          const checkInterval = setInterval(async () => {
            const statusResult = await supabase.functions.invoke('evolution-check-connection')
            if (statusResult.data?.status === 'connected') {
              setConnectionStatus('connected')
              setShowQrModal(false)
              setQrCodeData(null)
              clearInterval(checkInterval)
              toast({
                title: "WhatsApp conectado!",
                description: "Agora você pode enviar mensagens",
              })
            }
          }, 3000)
          
          // Limpar interval após 2 minutos
          setTimeout(() => clearInterval(checkInterval), 120000)
        } else {
          // Já conectado
          setConnectionStatus('connected')
          toast({
            title: "WhatsApp já conectado!",
            description: "Instância já está ativa",
          })
        }
      } else {
        setConnectionStatus('error')
        toast({
          title: "Erro ao conectar",
          description: data?.error || "Erro desconhecido",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error('Erro ao conectar:', err)
      setConnectionStatus('error')
      toast({
        title: "Erro ao conectar",
        description: err.message || "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

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
    <div className="w-full max-w-4xl space-y-6">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
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

        {/* Status da Conexão */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold">Status da Conexão WhatsApp</h3>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'checking' ? 'bg-blue-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Conectado' :
               connectionStatus === 'connecting' ? 'Conectando...' :
               connectionStatus === 'checking' ? 'Verificando...' :
               'Desconectado'}
            </span>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={connectInstance}
              disabled={!formData.enabled || !formData.server_url || !formData.instance_name || connectionStatus === 'connecting'}
              size="sm"
            >
              {connectionStatus === 'connecting' ? 'Conectando...' : 'Conectar WhatsApp'}
            </Button>
            
            <Button
              onClick={checkConnectionStatus}
              variant="outline"
              disabled={connectionStatus === 'checking'}
              size="sm"
            >
              {connectionStatus === 'checking' ? 'Verificando...' : 'Verificar Status'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server_url">URL do Servidor *</Label>
          <Input
            id="server_url"
            placeholder="https://your-evolution-api.com"
            value={formData.server_url}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, server_url: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instance_name">Nome da Instância *</Label>
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
          <Label htmlFor="default_country_code">Código de País Padrão</Label>
          <Input
            id="default_country_code"
            placeholder="+55"
            value={formData.default_country_code}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, default_country_code: e.target.value }))
            }
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={saveConfig} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
          
          <Button onClick={testConnection} variant="outline" disabled={testing}>
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
        </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <EvolutionAPITester />
        </TabsContent>
      </Tabs>

      {/* Modal do QR Code */}
      {showQrModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Escaneie o QR Code</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Use seu WhatsApp para escanear este código e conectar a instância
            </p>
            
            <div className="flex justify-center mb-4">
              <img 
                src={qrCodeData} 
                alt="QR Code WhatsApp" 
                className="max-w-full h-auto border rounded"
                style={{ maxHeight: '300px' }}
              />
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Aguardando conexão...</span>
            </div>
            
            <Button 
              onClick={() => {
                setShowQrModal(false)
                setQrCodeData(null)
              }}
              variant="outline" 
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}