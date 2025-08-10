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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MessageCircle, Wifi, X, Search, Loader2 } from 'lucide-react';

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
    server_url: 'http://72.60.7.194:8081',
    instance_name: 'lucas',
    default_country_code: '+55',
    enabled: true
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error' | 'checking'>('checking')
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [diagData, setDiagData] = useState<any | null>(null)
  const [showDiagModal, setShowDiagModal] = useState(false)
  const [diagLoading, setDiagLoading] = useState(false)
  const [openingManager, setOpeningManager] = useState(false)
  const [sendNumber, setSendNumber] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [sendText, setSendText] = useState<string>('Teste via Evolution ✅')
  const [sendResult, setSendResult] = useState<any | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [testProgress, setTestProgress] = useState<string>('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
const [discovering, setDiscovering] = useState(false)
const [discoveryResult, setDiscoveryResult] = useState<any>(null)
const [showDiscovery, setShowDiscovery] = useState(false)
const [prefixOverride, setPrefixOverride] = useState<string>('')

// Normaliza e valida prefixos permitidos para evitar varreduras longas com valores inválidos
const allowedPrefixes = ['', '/api', '/api/v1', '/v1', '/v1/api', '/evolution', '/evolution/api'] as const
const normalizeAllowedPrefix = (p: string): string => {
  const trimmed = (p || '').trim()
  if (!trimmed) return ''
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const noTrailing = withSlash.replace(/\/$/, '')
  return allowedPrefixes.includes(noTrailing as any) ? noTrailing : ''
}


  useEffect(() => {
    if (config?.enabled && config?.server_url && config?.instance_name) {
      checkConnectionStatus()
    }
  }, [config?.enabled, config?.server_url, config?.instance_name])

  const loadConfig = async () => {
    try {
      // Buscar via Edge Function admin (ignora RLS)
      const { data, error } = await supabase.functions.invoke('admin-api-config', {
        body: { action: 'get_evolution_config' }
      });

      if (error) {
        console.error('Erro ao carregar configuração (admin-api-config):', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a configuração",
          variant: "destructive",
        });
        return;
      }

      const cfg = data?.config;
      if (cfg) {
        setConfig(cfg);
        setFormData({
          server_url: cfg.server_url || 'http://72.60.7.194:8081',
          instance_name: cfg.instance_name || 'lucas',
          default_country_code: cfg.default_country_code || '+55',
          enabled: cfg.enabled ?? true
        });
      } else {
        setFormData({
          server_url: 'http://72.60.7.194:8081',
          instance_name: 'lucas',
          default_country_code: '+55',
          enabled: true
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
      const payload = {
        action: 'save_evolution_config',
        server_url: formData.server_url,
        instance_name: formData.instance_name,
        default_country_code: formData.default_country_code || '+55',
        enabled: formData.enabled,
      };

      const { data, error } = await supabase.functions.invoke('admin-api-config', { body: payload });

      if (error) {
        throw error;
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao salvar configuração');
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
    setConnectionStatus('connecting');
    
    // Step 1: Test basic connectivity
    toast({
      title: "🔄 Passo 1/4: Testando servidor...",
      description: "Verificando se o servidor Evolution está acessível",
    });

    try {
      const connectivityTest = await supabase.functions.invoke('evolution-test-connectivity');
      
      if (connectivityTest.error || !connectivityTest.data?.success) {
        setConnectionStatus('error');
        toast({
          title: "❌ Servidor inacessível",
          description: "O servidor Evolution API não está respondendo. Verifique a configuração.",
          variant: "destructive"
        });
        return;
      }

      if (!connectivityTest.data.connectivity.reachable) {
        setConnectionStatus('error');
        toast({
          title: "❌ Servidor não responde",
          description: `${connectivityTest.data.connectivity.error || 'Servidor offline'}. Verifique se o servidor está online.`,
          variant: "destructive"
        });
        return;
      }

      // Step 2: Check if instance already exists
      toast({
        title: "🔄 Passo 2/4: Verificando instância...",
        description: "Verificando se a instância já existe",
      });

      const statusCheck = await supabase.functions.invoke('evolution-check-connection');
      
      // Step 3: Create instance if it doesn't exist
      if (!statusCheck.data?.success || statusCheck.data?.status === 'disconnected') {
        toast({
          title: "🔄 Passo 3/4: Criando instância...",
          description: "Criando instância no servidor Evolution",
        });

        const createResult = await supabase.functions.invoke('evolution-create-instance');
        
        if (createResult.error || !createResult.data?.success) {
          let errorTitle = "⚠️ Falha ao criar instância (tentaremos conectar mesmo assim)";
          let errorDescription = createResult.data?.error || createResult.error?.message || "Erro ao criar instância";
          
          // Add suggestion if available
          if (createResult.data?.suggestion) {
            errorDescription += ` ${createResult.data.suggestion}`;
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive"
          });
          // Prosseguir para tentativa de conexão mesmo com erro de criação
        }
        
        if (createResult.data?.success) {
          toast({
            title: "✅ Instância criada!",
            description: "Prosseguindo para conexão WhatsApp...",
          });
        }
      }

      // Step 4: Connect to WhatsApp and get QR code
      toast({
        title: "🔄 Passo 4/4: Conectando WhatsApp...",
        description: "Iniciando conexão com WhatsApp...",
      });

      const { data, error } = await supabase.functions.invoke('evolution-connect-instance');

      if (error) {
        console.error('Erro ao conectar:', error);
        setConnectionStatus('error');
        toast({
          title: "❌ Erro ao conectar",
          description: error.message || "Erro desconhecido",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        // If QR code is returned, show modal
        if (data.data?.qrcode || data.data?.qr || data.data?.base64) {
          const qrCode = data.data.qrcode || data.data.qr || data.data.base64;
          
          // Handle base64 QR code
          const qrCodeToShow = qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`;
          
          setQrCodeData(qrCodeToShow);
          setShowQrModal(true);
          setConnectionStatus('connecting');
          
          toast({
            title: "📱 QR Code gerado!",
            description: "Escaneie o QR Code com seu WhatsApp para conectar",
          });
          
          // Poll for connection status every 2s for up to 60s
          let pollAttempts = 0;
          const maxPollAttempts = 30; // 30 attempts * 2s = 60s
          
          const checkInterval = setInterval(async () => {
            pollAttempts++;
            
            const statusResult = await supabase.functions.invoke('evolution-check-connection');
            
            if (statusResult.data?.success && statusResult.data?.connectionStatus === 'connected') {
              setConnectionStatus('connected');
              setShowQrModal(false);
              setQrCodeData(null);
              clearInterval(checkInterval);
              toast({
                title: "✅ WhatsApp conectado!",
                description: "Agora você pode enviar mensagens via Evolution API",
              });
            } else if (pollAttempts >= maxPollAttempts) {
              clearInterval(checkInterval);
              setConnectionStatus('error');
              setShowQrModal(false);
              setQrCodeData(null);
              toast({
                title: "⏰ Timeout de conexão",
                description: "WhatsApp não foi conectado no tempo esperado. Tente novamente.",
                variant: "destructive"
              });
            }
          }, 2000);
          
        } else if (data.data?.instance?.state === 'open') {
          // Already connected
          setConnectionStatus('connected');
          toast({
            title: "✅ WhatsApp já conectado!",
            description: "A instância já está ativa e pronta para uso",
          });
        } else {
          setConnectionStatus('error');
          toast({
            title: "❌ Resposta inesperada",
            description: "O servidor respondeu mas não retornou QR code nem confirmação de conexão",
            variant: "destructive"
          });
        }
        } else {
          setConnectionStatus('error');
          const errStr = String(data?.error || '');
          const hasCannotPost = errStr.includes('Cannot POST');
          const hasFindMany = errStr.includes('findMany') || JSON.stringify(data || {}).includes('findMany');
          const extraHint = hasCannotPost
            ? 'Usamos GET automaticamente para conectar, mas o servidor não aceitou. Se houver erro 500 com "findMany", ajuste o banco/ORM no servidor Evolution.'
            : (data?.suggestion || '');
          const desc = (data?.error || 'Servidor respondeu mas falhou ao conectar') + (extraHint ? ` ${extraHint}` : '');
          toast({
            title: '❌ Falha na conexão',
            description: desc,
            variant: 'destructive'
          });
        }
    } catch (err: any) {
      console.error('Erro ao conectar:', err);
      setConnectionStatus('error');
      toast({
        title: "❌ Erro inesperado",
        description: err.message || "Erro desconhecido durante o processo de conexão",
        variant: "destructive"
      });
    }
  };

  const testConnection = async () => {
    if (testing) return
    setTesting(true)
    
    try {
      console.log('🔍 Testando conectividade...', { server_url: formData.server_url })
      const { data, error } = await supabase.functions.invoke('evolution-test-connectivity')
      
      if (error) {
        console.error('❌ Erro na função de teste:', error)
        toast({
          title: "Erro no Teste",
          description: `Falha ao executar teste: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log('📊 Resultado do teste:', data)

      if (data.success) {
        const isReachable = data.connectivity.reachable
        const responseTime = data.connectivity.responseTime
        
        toast({
          title: isReachable ? "Servidor Acessível ✅" : "Servidor Inacessível ❌",
          description: isReachable 
            ? `Servidor respondeu em ${responseTime}ms. API Key: ${data.api_key_status === 'configured' ? 'OK' : 'Não configurada'}`
            : `${data.connectivity.error || 'Servidor offline'}`,
          variant: isReachable ? "default" : "destructive",
        })
        
        // Mostrar recomendações
        if (data.recommendations?.length > 0) {
          console.log('💡 Recomendações:', data.recommendations)
          data.recommendations.forEach((rec: string) => {
            toast({
              title: "💡 Recomendação",
              description: rec,
              variant: "default",
            })
          })
        }
        
        if (data.protocol_suggestion) {
          console.log('🔒 Sugestão de protocolo:', data.protocol_suggestion)
          toast({
            title: "💡 Sugestão de HTTPS",
            description: data.protocol_suggestion.message,
            variant: "default",
          })
        }
      } else {
        // Erros específicos
        if (data.error?.includes('API Key Evolution não configurada')) {
          toast({
            title: "❌ API Key Não Configurada",
            description: "Configure a variável EVOLUTION_API_KEY no painel do Supabase (Edge Functions → Secrets)",
            variant: "destructive",
          })
        } else {
          toast({
            title: "❌ Erro no Teste",
            description: data.error || "Erro desconhecido no teste",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error('❌ Erro inesperado no teste:', error)
      toast({
        title: "❌ Erro Inesperado", 
        description: `Falha na comunicação: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const diagnoseConnection = async () => {
    if (diagLoading) return
    setDiagLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('evolution-diagnose')
      if (error) {
        console.error('Erro no diagnóstico:', error)
        toast({ title: 'Erro no diagnóstico', description: error.message || 'Falha ao executar diagnóstico', variant: 'destructive' })
        return
      }
      setDiagData(data)
      setShowDiagModal(true)
      toast({ title: 'Diagnóstico concluído', description: 'Confira o relatório detalhado' })
    } catch (err: any) {
      console.error('Erro no diagnóstico:', err)
      toast({ title: 'Erro inesperado', description: err.message || 'Falha ao executar diagnóstico', variant: 'destructive' })
    } finally {
      setDiagLoading(false)
    }
}

const recoverConnection = async () => {
  try {
    toast({ title: 'Recuperando conexão...', description: 'Enfileirando processo e atualizando status' });
    const { data, error } = await supabase.functions.invoke('evolution-recover-connection');
    if (error) throw error;
    if (data?.success) {
      toast({ title: 'Recuperação iniciada', description: data?.message || 'Processo disparado' });
    } else {
      toast({ title: 'Falha na recuperação', description: data?.error || 'Erro desconhecido', variant: 'destructive' });
    }
  } catch (e: any) {
    toast({ title: 'Erro na recuperação', description: e?.message || 'Erro desconhecido', variant: 'destructive' });
  } finally {
    checkConnectionStatus();
  }
}

const discoverEndpoints = async () => {
  setDiscovering(true);
  setDiscoveryResult(null);

  try {
    const { data, error } = await supabase.functions.invoke('evolution-discover-endpoints', {
      body: {
        prefix: normalizeAllowedPrefix(prefixOverride) || undefined,
        timeoutMs: 1200,
        budgetMs: 12000,
        concurrency: 6,
      },
    });
    
    if (error) {
      throw new Error(error.message);
    }

    setDiscoveryResult(data);
    setShowDiscovery(true);
    
    if (data?.success && ((data?.diagnostic?.recommendations?.length ?? 0) > 0 || (data?.workingEndpoints?.length ?? 0) > 0)) {
      toast({
        title: "✅ Descoberta concluída",
        description: `Encontrados ${data?.workingEndpoints?.length || 0} endpoints`,
      });
    } else {
      const msg = data?.error || "Nenhum endpoint funcional foi encontrado automaticamente";
      toast({
        title: "⚠️ Nenhum endpoint encontrado",
        description: msg,
        variant: "destructive"
      });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    setDiscoveryResult({ success: false, error: errorMsg });
    toast({
      title: "❌ Erro na descoberta",
      description: `Erro na descoberta: ${errorMsg}`,
      variant: "destructive"
    });
  } finally {
    setDiscovering(false);
  }
};

const sendTestMessage = async () => {
  const raw = sendNumber || '';
  const cleaned = raw.replace(/\D/g, '');
  if (!cleaned) {
    toast({ title: 'Número inválido', description: 'Informe um número com DDI e DDD', variant: 'destructive' });
    return;
  }
  if (!sendText?.trim()) {
    toast({ title: 'Mensagem vazia', description: 'Digite a mensagem a ser enviada', variant: 'destructive' });
    return;
  }
  setSending(true);
  setSendResult(null);
  setTestProgress('Verificando servidor e instância...');
  
  const controller = new AbortController();
  setAbortController(controller);
  
  try {
    const base_url = (config?.server_url || formData.server_url || '').replace(/\/$/, '');
    const instance = config?.instance_name || formData.instance_name || 'lucas';
    const { data, error } = await supabase.functions.invoke('evolution-send-text', { body: { number: cleaned, text: sendText, base_url, instance, prefix: prefixOverride } });
    if (error) throw error;
    setSendResult(data);
    
    if (data?.diagnostics?.recommendations?.length > 0) {
      setTestProgress('Teste concluído com recomendações');
    } else if (data?.success) {
      setTestProgress('Mensagem enviada com sucesso!');
    } else {
      setTestProgress('Falha no envio da mensagem');
    }
    
    if (data?.success) {
      toast({ title: 'Enviado ✅', description: `HTTP ${data.status} • ${data.responseTimeMs}ms` });
    } else {
      toast({ title: 'Falha no envio', description: data?.error || `HTTP ${data?.status} • ${data?.responseTimeMs}ms`, variant: 'destructive' });
    }
  } catch (e: any) {
    setSendResult({ success: false, error: e?.message, diagnostics: null });
    setTestProgress('Erro na comunicação');
    toast({ title: 'Erro no envio', description: e?.message || 'Erro desconhecido', variant: 'destructive' });
  } finally {
    setSending(false);
    setAbortController(null);
  }
};

const cancelTest = () => {
  if (abortController) {
    abortController.abort();
    setAbortController(null);
    setSending(false);
    setTestProgress('Teste cancelado');
  }
};


const fetchRecentEvents = async () => {
  setEventsLoading(true);
  try {
    const { data, error } = await supabase
      .from('evolution_webhook_events')
      .select('id, created_at, event_type, instance_name, status')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    setEvents(data || []);
  } catch (e: any) {
    toast({ title: 'Sem permissão ou erro', description: e?.message || 'Não foi possível carregar eventos', variant: 'destructive' });
  } finally {
    setEventsLoading(false);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'Comando copiado para a área de transferência' });
  } catch {
    toast({ title: 'Falha ao copiar', variant: 'destructive' });
  }
};

const buildBaseUrl = (url: string, forceHttps = false) => {
  try {
    const u = new URL(url);
    if (forceHttps) u.protocol = 'https:';
    return u.toString().replace(/\/$/, '');
  } catch {
    let out = url || '';
    if (forceHttps) out = out.replace(/^http:/, 'https:');
    return out.replace(/\/$/, '');
  }
};

const handleOpenManager = async (forceHttps = false) => {
  if (!formData.server_url) {
    toast({ title: 'URL ausente', description: 'Defina a URL do servidor', variant: 'destructive' });
    return;
  }
  setOpeningManager(true);
  try {
    toast({ title: 'Verificando servidor...', description: 'Testando acessibilidade antes de abrir o Manager' });

    const { data, error } = await supabase.functions.invoke('evolution-test-connectivity');
    if (error || !data?.success) {
      toast({ title: 'Servidor inacessível', description: error?.message || data?.error || 'Falha no teste de conectividade', variant: 'destructive' });
      await diagnoseConnection();
      return;
    }
    if (!data.connectivity?.reachable) {
      const reason = data.connectivity?.error || 'Servidor offline';
      toast({ title: 'Servidor não acessível', description: reason, variant: 'destructive' });
      if (data.protocol_suggestion?.use_https && !forceHttps) {
        toast({ title: 'Sugestão', description: data.protocol_suggestion?.message });
      }
      await diagnoseConnection();
      return;
    }

    const base = buildBaseUrl(formData.server_url, forceHttps);
    window.open(`${base}/manager`, '_blank');
  } catch (e: any) {
    toast({ title: 'Erro ao abrir', description: e.message || 'Erro desconhecido', variant: 'destructive' });
  } finally {
    setOpeningManager(false);
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

          <div className="flex flex-wrap gap-2">
            {connectionStatus !== 'connected' && (
              <Button
                onClick={connectInstance}
                disabled={!formData.enabled || !formData.server_url || !formData.instance_name || connectionStatus === 'connecting'}
                size="sm"
              >
                {connectionStatus === 'connecting' ? 'Conectando...' : 'Conectar WhatsApp'}
              </Button>
            )}
            <Button
              onClick={checkConnectionStatus}
              variant="outline"
              disabled={connectionStatus === 'checking'}
              size="sm"
            >
              {connectionStatus === 'checking' ? 'Verificando...' : 'Atualizar status'}
            </Button>
            {connectionStatus !== 'connected' && (
              <Button
                onClick={recoverConnection}
                variant="outline"
                size="sm"
              >
                Recuperar conexão
              </Button>
            )}
            <Button
              onClick={() => handleOpenManager(false)}
              variant="outline"
              size="sm"
              disabled={openingManager}
            >
              {openingManager ? 'Abrindo...' : 'Abrir Manager'}
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
          
          <Button onClick={testConnection} variant="outline" disabled={testing || !formData.server_url}>
            {testing ? 'Testando...' : 'Testar Conectividade'}
          </Button>
          
          <Button 
            onClick={discoverEndpoints} 
            disabled={discovering || !formData.server_url}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {discovering && <Loader2 className="h-4 w-4 animate-spin" />}
            <Search className="h-4 w-4" />
            Descobrir Endpoints
          </Button>
        </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Disparo de teste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="send_number">Número (E.164 sem símbolos)</Label>
                <Input
                  id="send_number"
                  placeholder="Ex: 5548999999999"
                  value={sendNumber}
                  onChange={(e) => setSendNumber(e.target.value)}
                />
                <Label htmlFor="prefix_override">Prefixo de caminho (opcional)</Label>
                <Input
                  id="prefix_override"
                  placeholder="/api"
                  value={prefixOverride}
                  onChange={(e) => setPrefixOverride(e.target.value)}
                />
                <Label htmlFor="send_text">Mensagem</Label>
                <Input
                  id="send_text"
                  placeholder="Digite a mensagem"
                  value={sendText}
                  onChange={(e) => setSendText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={sendTestMessage} disabled={sending || !sendNumber} className="flex items-center gap-2">
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Enviar via Evolution
                      </>
                    )}
                  </Button>
                  
                  {sending && (
                    <Button 
                      onClick={cancelTest}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => { setSendNumber(''); setSendText('Teste via Evolution ✅'); setSendResult(null); setTestProgress(''); }}>Limpar</Button>
                </div>
                
                {testProgress && (
                  <div className="text-sm text-muted-foreground">
                    {testProgress}
                  </div>
                )}
                {sendResult && (
                  <div className="border rounded p-4 bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      {sendResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {sendResult.success ? 'Sucesso' : 'Falha'}
                      </span>
                      {sendResult.status && (
                        <Badge variant="outline">
                          HTTP: {sendResult.status} • {sendResult.responseTimeMs || 0}ms
                        </Badge>
                      )}
                    </div>

                    {/* Diagnostics Section */}
                    {sendResult.diagnostics && (
                      <div className="mb-3 p-3 bg-blue-50 rounded border">
                        <div className="text-sm font-medium mb-2 text-blue-900">Diagnóstico da Instância</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-700">Servidor:</span>
                            <Badge variant={sendResult.diagnostics.serverHealth === 200 ? "default" : "destructive"}>
                              {sendResult.diagnostics.serverHealth || 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-700">Estado da Instância:</span>
                            <Badge variant={sendResult.diagnostics.instanceReady ? "default" : "secondary"}>
                              {sendResult.diagnostics.instanceState}
                            </Badge>
                            {sendResult.diagnostics.instanceReady ? (
                              <span className="text-green-600 text-xs">✓ Pronta</span>
                            ) : (
                              <span className="text-orange-600 text-xs">⚠ Não pronta</span>
                            )}
                          </div>
                        </div>
                        
                        {sendResult.diagnostics.recommendations?.length > 0 && (
                          <div className="mt-2 p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                            <div className="text-sm font-medium text-orange-800">Recomendações:</div>
                            <ul className="text-sm text-orange-700 mt-1">
                              {sendResult.diagnostics.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {sendResult.endpoint && (
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Endpoint:</strong> {sendResult.endpoint}
                      </div>
                    )}
                    
                    {Array.isArray(sendResult.attempts) && sendResult.attempts.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">
                          Tentativas ({sendResult.attempts.length}):
                        </div>
                        <div className="space-y-1 text-xs font-mono bg-muted p-2 rounded max-h-32 overflow-auto">
                          {sendResult.attempts.map((attempt: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-blue-600">#{i + 1}</span>
                              <span className="text-purple-600">•</span>
                              <span className="text-orange-600">R{attempt.round}</span>
                              <span className="text-purple-600">•</span>
                              <span className="text-green-600">{attempt.method}</span>
                              <span className="text-purple-600">•</span>
                              <span className={attempt.ok ? "text-green-600" : "text-red-600"}>
                                {attempt.status || '—'}
                              </span>
                              <span className="text-muted-foreground">
                                {attempt.elapsed || '—'}ms
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {attempt.url}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {sendResult.error && (
                      <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>Erro:</strong> {sendResult.error}
                      </div>
                    )}
                    
                    {sendResult.body && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Resposta:</div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(sendResult.body, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {sendResult.requestId && (
                      <div className="text-xs text-muted-foreground">
                        ID: {sendResult.requestId}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Certifique-se de que o WhatsApp esteja conectado.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos recentes (webhook)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={fetchRecentEvents} disabled={eventsLoading}>
                    {eventsLoading ? 'Carregando...' : 'Atualizar'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem eventos carregados. Clique em Atualizar.</p>
                  ) : (
                    events.map((ev) => (
                      <div key={ev.id} className="border rounded px-3 py-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{ev.event_type || 'event'}</span>
                          <span className="text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-muted-foreground">Instância: {ev.instance_name || '—'} | Status: {ev.status || '—'}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4">
            <EvolutionAPITester />
          </div>
        </TabsContent>
      </Tabs>

      {/* Discovery Results */}
      {discoveryResult && showDiscovery && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Descoberta de Endpoints
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDiscovery(false)}
                className="ml-auto"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {discoveryResult.success ? (
              <div className="space-y-4">
                {discoveryResult.recommendations?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Endpoints Recomendados:</h4>
                    <div className="space-y-2">
                      {discoveryResult.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={rec.type === 'primary' ? 'default' : 'secondary'}>
                              {rec.type === 'primary' ? 'Principal' : 'Alternativo'}
                            </Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {rec.method} {rec.endpoint}
                            </code>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tipo: {rec.apiType} • {rec.reason}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            URL: {rec.testUrl}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {discoveryResult.workingEndpoints?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Todos os Endpoints Funcionais:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {discoveryResult.workingEndpoints.map((endpoint: any, index: number) => (
                        <div key={index} className="text-sm flex justify-between items-center p-2 bg-muted rounded">
                          <span>{endpoint.method} {endpoint.pattern}</span>
                          <Badge variant="outline">Status: {endpoint.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <strong>Resumo:</strong> Testados {discoveryResult.diagnostic?.endpointTesting?.totalTested} endpoints, 
                  encontrados {discoveryResult.diagnostic?.endpointTesting?.workingCount} funcionais.
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <strong>Erro na descoberta:</strong> {discoveryResult.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Diagnóstico */}
      {showDiagModal && diagData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background text-foreground rounded-lg p-6 max-w-3xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Relatório de Diagnóstico Evolution API</h3>

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex items-center justify-between border rounded px-3 py-2">
                <span className="font-medium">Versão</span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                  {diagData?.results?.root?.body?.version || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between border rounded px-3 py-2">
                <span className="font-medium">Connect esperado</span>
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {(() => {
                    const cp = diagData?.results?.connectPost;
                    const notAllowed = cp?.status === 404 || cp?.status === 405 || JSON.stringify(cp?.body || '').includes('Cannot POST');
                    return notAllowed ? 'GET' : 'POST';
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between border rounded px-3 py-2">
                <span className="font-medium">API Key</span>
                <span className={`px-2 py-1 rounded ${diagData?.config?.api_key_present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {diagData?.config?.api_key_present ? 'Configurada' : 'Ausente'}
                </span>
              </div>
              <div className="flex items-center justify-between border rounded px-3 py-2">
                <span className="font-medium">Banco/ORM</span>
                <span className={`px-2 py-1 rounded ${JSON.stringify(diagData?.results || {}).includes('findMany') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {JSON.stringify(diagData?.results || {}).includes('findMany') ? 'Erro (findMany)' : 'OK'}
                </span>
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => window.open(`${(diagData?.config?.base_url || formData.server_url || '').replace(/\/$/, '')}/manager`, '_blank')}
                size="sm"
              >
                Abrir Manager
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`${(diagData?.config?.base_url || formData.server_url || '').replace(/\/$/, '')}`, '_blank')}
                size="sm"
              >
                Abrir Root
              </Button>
            </div>

            {/* Aviso específico: erro findMany */}
            {(() => {
              const hasFindMany = JSON.stringify(diagData || {}).includes('findMany');
              if (!hasFindMany) return null;
              const fixCmds = [
                { label: 'Aplicar migrações (Prisma)', cmd: 'npx prisma migrate deploy' },
                { label: 'Gerar Prisma Client', cmd: 'npx prisma generate' },
                { label: 'Reiniciar serviço (PM2)', cmd: 'pm2 restart all' },
                { label: 'Reiniciar container (Docker)', cmd: 'docker ps --filter "name=evolution" --format "{{.ID}}" | xargs -r docker restart' },
                { label: 'Verificar variáveis (.env)', cmd: 'echo $DATABASE_URL && echo $DATABASE_PROVIDER' },
              ];
              return (
                <div className="border rounded p-3 mb-4 bg-red-50 border-red-200">
                  <h4 className="font-semibold text-red-700 mb-1">Possível problema no banco de dados (erro "findMany")</h4>
                  <p className="text-sm text-red-700/90">
                    Seu servidor Evolution API retornou erro 500 envolvendo "findMany". Isso normalmente indica que o ORM/banco não foi inicializado.
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-red-800 space-y-1">
                    <li>Confirme DATABASE_URL e (se aplicável) DATABASE_PROVIDER</li>
                    <li>Aplicar migrações do banco</li>
                    <li>Gerar Prisma Client</li>
                    <li>Reiniciar o serviço (PM2) ou container (Docker)</li>
                  </ul>
                  <div className="mt-3 space-y-2">
                    {fixCmds.map((item) => (
                      <div key={item.label} className="border rounded p-2 bg-background">
                        <div className="flex items-center justify-between mb-2 text-sm font-medium">
                          <span>{item.label}</span>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(item.cmd)}>Copiar</Button>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap break-words font-mono bg-muted text-foreground p-2 rounded">{item.cmd}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Comandos cURL */}
            <div className="space-y-3 mb-4">
              <h4 className="font-semibold">Comandos cURL úteis</h4>
              {(() => {
                const base = (diagData?.config?.base_url || formData.server_url || '').replace(/\/$/, '');
                const inst = diagData?.config?.instance || formData.instance_name;
                const apiHeader = "-H 'apikey: YOUR_API_KEY' -H 'Content-Type: application/json'";
                const curlCreatePost = `curl -X POST ${apiHeader} ${base}/instance/create -d '{"instanceName":"${inst}"}'`;
                const curlConnectGet = `curl -X GET ${apiHeader} ${base}/instance/connect/${inst}`;
                const curlConnectPost = `curl -X POST ${apiHeader} ${base}/instance/connect/${inst}`;
                const curlConnState = `curl -X GET ${apiHeader} ${base}/instance/connectionState/${inst}`;
                return (
                  <div className="space-y-2">
                    {[
                      { label: 'Criar instância (POST)', cmd: curlCreatePost },
                      { label: 'Conectar (GET)', cmd: curlConnectGet },
                      { label: 'Conectar (POST)', cmd: curlConnectPost },
                      { label: 'Ver status (GET)', cmd: curlConnState },
                    ].map((item) => (
                      <div key={item.label} className="border rounded p-2">
                        <div className="flex items-center justify-between mb-2 text-sm font-medium">
                          <span>{item.label}</span>
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(item.cmd)}>Copiar</Button>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap break-words font-mono bg-muted text-foreground p-2 rounded">{item.cmd}</pre>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* JSON bruto */}
            <div className="max-h-[40vh] overflow-auto border rounded p-3 text-sm bg-muted">
              {(() => {
                const json = JSON.stringify(diagData, null, 2) || '';
                const html = json.replace(/findMany/g, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">findMany</mark>');
                return (
                  <pre className="whitespace-pre-wrap break-words font-mono text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
                );
              })()}
            </div>

            <div className="mt-4">
              <Button onClick={() => setShowDiagModal(false)} className="w-full" variant="outline">Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do QR Code */}
      {showQrModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background text-foreground rounded-lg p-6 max-w-md mx-4">
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
