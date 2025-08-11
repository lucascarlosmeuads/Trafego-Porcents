import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { invokeEdge } from '@/integrations/supabase/invokeEdge';

interface SyncResult {
  totalFetched: number;
  updated: number;
  inserted: number;
  alreadySynced: number;
  skipped: number;
  start_date: string;
  end_date: string;
  summary: string;
  details: Array<{
    email?: string;
    order_id?: string;
    action?: string;
    error?: string;
    skipped?: boolean;
    reason?: string;
    lead_id?: string;
    existing_data?: any;
  }>;
}

export const KiwifySyncPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('2025-08-01');
  const [endDate, setEndDate] = useState('2025-08-10');
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!startDate || !endDate) {
      toast.error('Por favor, preencha ambas as datas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Data de início deve ser anterior à data de fim');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSyncResult(null);

    try {
      console.log('Iniciando sincronização Kiwify:', { startDate, endDate });
      
      const res = await invokeEdge<SyncResult>('kiwify-sync-approved-orders', {
        start_date: startDate,
        end_date: endDate,
      });

      if (res.error || !res.data) {
        console.error('Erro na sincronização:', res.error);
        setError(`Erro na sincronização: ${res.error?.message || 'Falha ao chamar a Edge Function'}`);
        toast.error(res.error?.message || 'Erro ao executar sincronização');
        return;
      }

      const data = res.data;
      
      // OK
      setSyncResult(data);
      
      toast.success(data.summary || `Sincronização concluída! ${data.updated} atualizados, ${data.inserted} inseridos`);
      
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError(`Erro inesperado: ${err.message}`);
      toast.error('Erro inesperado durante a sincronização');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSyncResult(null);
    setError(null);
    setStartDate('2025-08-01');
    setEndDate('2025-08-10');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sincronização Kiwify</h1>
          <p className="text-muted-foreground">
            Sincronize vendas aprovadas da Kiwify com os leads do sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Sincronizar Vendas Aprovadas
          </CardTitle>
          <CardDescription>
            Busca vendas aprovadas na Kiwify para um período específico e atualiza os leads correspondentes no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Iniciar Sincronização
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Sincronizar Vendas Kiwify</DialogTitle>
                <DialogDescription>
                  Selecione o período para buscar vendas aprovadas na Kiwify.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Data de Início</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Data de Fim</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Erro na Sincronização</span>
                    </div>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                )}

                {syncResult && (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Sincronização Concluída</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary">{syncResult.totalFetched}</div>
                          <div className="text-xs text-muted-foreground">Vendas Kiwify</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{syncResult.updated}</div>
                          <div className="text-xs text-muted-foreground">Atualizados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{syncResult.inserted}</div>
                          <div className="text-xs text-muted-foreground">Inseridos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-yellow-600">{syncResult.alreadySynced || 0}</div>
                          <div className="text-xs text-muted-foreground">Já Sync.</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-500">{syncResult.skipped || 0}</div>
                          <div className="text-xs text-muted-foreground">Ignorados</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Período: {syncResult.start_date} a {syncResult.end_date}</span>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {syncResult.details.length} operações
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {syncResult.details.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded p-2">
                        <div className="text-xs text-muted-foreground mb-2">Detalhes das operações:</div>
                        {syncResult.details.slice(0, 10).map((detail, index) => (
                          <div key={index} className="text-xs py-1 flex items-center gap-2">
                            {detail.action === 'updated' && <CheckCircle className="h-3 w-3 text-green-600" />}
                            {detail.action === 'inserted' && <CheckCircle className="h-3 w-3 text-blue-600" />}
                            {detail.action === 'already_synced' && <CheckCircle className="h-3 w-3 text-yellow-600" />}
                            {detail.action?.includes('failed') && <XCircle className="h-3 w-3 text-red-600" />}
                            {detail.skipped && <AlertTriangle className="h-3 w-3 text-gray-600" />}
                            <span className="flex-1 truncate">{detail.email}</span>
                            <Badge variant="outline" className={`text-xs ${
                              detail.action === 'updated' ? 'bg-green-50 text-green-700' :
                              detail.action === 'inserted' ? 'bg-blue-50 text-blue-700' :
                              detail.action === 'already_synced' ? 'bg-yellow-50 text-yellow-700' :
                              detail.action?.includes('failed') ? 'bg-red-50 text-red-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {detail.action === 'updated' ? 'Atualizado' :
                               detail.action === 'inserted' ? 'Novo Lead' :
                               detail.action === 'already_synced' ? 'Já Sincronizado' :
                               detail.action?.includes('failed') ? 'Erro' :
                               detail.skipped ? 'Ignorado' :
                               detail.action || 'Processado'}
                            </Badge>
                          </div>
                        ))}
                        {syncResult.details.length > 10 && (
                          <div className="text-xs text-muted-foreground">
                            ... e mais {syncResult.details.length - 10} operações
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSync} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Executar Sincronização
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Vendas Aprovadas</p>
              <p className="text-sm text-muted-foreground">
                Busca apenas vendas com status "approved" na Kiwify
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Atualização de Leads</p>
              <p className="text-sm text-muted-foreground">
                Marca leads como "comprou" e "cliente_pago = true"
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium">Novos Registros</p>
              <p className="text-sm text-muted-foreground">
                Cria novos registros para emails não encontrados no sistema
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};