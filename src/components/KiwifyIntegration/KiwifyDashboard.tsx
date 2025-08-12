import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Copy, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KiwifyConfig {
  id: string;
  client_secret: string;
  client_id: string;
  account_id: string;
  webhook_url: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

interface KiwifyLog {
  id: string;
  webhook_data: any;
  email_comprador: string | null;
  lead_encontrado: boolean;
  lead_id: string | null;
  status_processamento: string;
  detalhes_erro: string | null;
  created_at: string;
}

export default function KiwifyDashboard() {
  const [config, setConfig] = useState<KiwifyConfig | null>(null);
  const [logs, setLogs] = useState<KiwifyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('kiwify_config')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao buscar configuração:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar configuração da Kiwify",
          variant: "destructive",
        });
        return;
      }

      setConfig(data);
    } catch (error) {
      console.error('Erro geral:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('kiwify_webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro geral:', error);
    }
  };

  const updateConfig = async (field: string, value: any) => {
    if (!config) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('kiwify_config')
        .update({ [field]: value })
        .eq('id', config.id);

      if (error) throw error;

      setConfig({ ...config, [field]: value });
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const copyWebhookUrl = () => {
    if (config?.webhook_url) {
      navigator.clipboard.writeText(config.webhook_url);
      toast({
        title: "Copiado!",
        description: "URL do webhook copiada para a área de transferência",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sucesso</Badge>;
      case 'erro':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      case 'lead_nao_encontrado':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Lead não encontrado</Badge>;
      default:
        return <Badge variant="outline">Processando</Badge>;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConfig();
      await fetchLogs();
      setLoading(false);
    };

    loadData();

    // Configurar realtime para logs (apenas inserts e updates)
    const channel = supabase
      .channel('kiwify_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kiwify_webhook_logs' },
        () => fetchLogs()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kiwify_webhook_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integração Kiwify</h1>
        <p className="text-muted-foreground">
          Configure e monitore a integração automática com vendas da Kiwify
        </p>
      </div>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>
            Gerencie as configurações da integração com a Kiwify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.ativa}
                  onCheckedChange={(value) => updateConfig('ativa', value)}
                  disabled={updating}
                />
                <Label>Integração Ativa</Label>
                <Badge variant={config.ativa ? "default" : "secondary"}>
                  {config.ativa ? "Ativa" : "Inativa"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Client ID</Label>
                  <Input value={config.client_id} disabled />
                </div>
                <div>
                  <Label>Account ID</Label>
                  <Input value={config.account_id} disabled />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input value="***************" disabled />
                </div>
              </div>

              <div>
                <Label>URL do Webhook</Label>
                <div className="flex space-x-2">
                  <Input value={config.webhook_url} disabled className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyWebhookUrl}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure esta URL como webhook na sua conta Kiwify
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Logs de Webhook</CardTitle>
            <CardDescription>
              Histórico das últimas 50 transações processadas
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Email Comprador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Encontrado</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {log.email_comprador || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status_processamento)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.lead_encontrado ? "default" : "secondary"}>
                        {log.lead_encontrado ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.detalhes_erro && (
                        <span className="text-sm text-red-600">
                          {log.detalhes_erro}
                        </span>
                      )}
                      {log.lead_id && !log.detalhes_erro && (
                        <span className="text-sm text-green-600">
                          Lead atualizado com sucesso
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}