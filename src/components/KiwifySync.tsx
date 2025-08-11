import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const KiwifySync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const syncKiwifyOrders = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      console.log(`🚀 Sincronizando pedidos Kiwify de ${startDate} até ${endDate}`);
      
      const { data, error } = await supabase.functions.invoke('kiwify-sync-approved-orders', {
        body: {
          start_date: startDate,
          end_date: endDate
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Sincronização concluída:', data);
      setLastResult(data);
      
      toast({
        title: "Sincronização concluída",
        description: `${data.updated} leads atualizados, ${data.inserted} novos leads criados`,
      });
      
    } catch (error: any) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reprocessWebhooks = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      console.log(`🔄 Reprocessando webhooks de ${startDate} até ${endDate}`);
      
      const { data, error } = await supabase.functions.invoke('reprocess-kiwify-webhooks', {
        body: {
          dateRange: {
            startDate,
            endDate
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Reprocessamento concluído:', data);
      setLastResult(data);
      
      toast({
        title: "Reprocessamento concluído",
        description: `${data.updated} leads atualizados de ${data.processed} webhooks processados`,
      });
      
    } catch (error: any) {
      console.error('❌ Erro no reprocessamento:', error);
      toast({
        title: "Erro no reprocessamento",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAug10 = () => syncKiwifyOrders('2025-08-10', '2025-08-10');
  const handleSyncToday = () => {
    const today = new Date().toISOString().split('T')[0];
    syncKiwifyOrders(today, today);
  };
  const handleReprocessAug10 = () => reprocessWebhooks('2025-08-10', '2025-08-10');
  const handleReprocessToday = () => {
    const today = new Date().toISOString().split('T')[0];
    reprocessWebhooks(today, today);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sincronização Kiwify
          </CardTitle>
          <CardDescription>
            Sincronizar vendas aprovadas do Kiwify que não chegaram via webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleSyncAug10}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Sincronizar 10/08 (45 vendas)
            </Button>
            
            <Button 
              onClick={handleSyncToday}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Sincronizar Hoje
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleReprocessAug10}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
              Reprocessar Webhooks 10/08
            </Button>
            
            <Button 
              onClick={handleReprocessToday}
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
              Reprocessar Webhooks Hoje
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Último Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastResult.updated !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge variant="default">{lastResult.updated} atualizados</Badge>
                  <Badge variant="secondary">{lastResult.inserted || 0} inseridos</Badge>
                  <Badge variant="outline">{lastResult.alreadySynced || lastResult.webhooks_found || 0} já sincronizados</Badge>
                </div>
              )}
              
              {lastResult.summary && (
                <p className="text-sm text-muted-foreground">{lastResult.summary}</p>
              )}
              
              {lastResult.start_date && lastResult.end_date && (
                <p className="text-xs text-muted-foreground">
                  Período: {lastResult.start_date} até {lastResult.end_date}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};