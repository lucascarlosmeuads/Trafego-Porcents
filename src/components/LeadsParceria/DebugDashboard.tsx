import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DebugDashboardProps {
  leads: any[];
  dateRange: { start: number; end: number } | null;
  onReprocess: () => Promise<any>;
}

export function DebugDashboard({ leads, dateRange, onReprocess }: DebugDashboardProps) {
  const [reprocessing, setReprocessing] = useState(false);
  const { toast } = useToast();

  const stats = {
    totalLeads: leads.length,
    leadsHoje: dateRange ? leads.filter(l => {
      const t = new Date(l.created_at).getTime();
      return t >= dateRange.start && t <= dateRange.end;
    }).length : 0,
    
    vendasWebhook: dateRange ? leads.filter(l => {
      if (!l.webhook_automatico) return false;
      const dtStr = l.webhook_data_compra || l.data_compra;
      if (!dtStr) return false;
      const dt = new Date(dtStr).getTime();
      return dt >= dateRange.start && dt <= dateRange.end;
    }).length : 0,
    
    vendasSistema: dateRange ? leads.filter(l => {
      if (!['comprou', 'planejando', 'planejamento_entregue', 'upsell_pago'].includes(l.status_negociacao)) return false;
      if (!l.cliente_pago) return false;
      const dtStr = l.data_compra || l.webhook_data_compra;
      if (!dtStr) return false;
      const dt = new Date(dtStr).getTime();
      return dt >= dateRange.start && dt <= dateRange.end;
    }).length : 0,
    
    leadsPagosDesatualizados: leads.filter(l => 
      l.cliente_pago && l.status_negociacao !== 'comprou' && 
      !['planejando', 'planejamento_entregue', 'upsell_pago'].includes(l.status_negociacao)
    ).length,
    
    leadsWebhookSemStatus: leads.filter(l => 
      l.webhook_automatico && (!l.cliente_pago || l.status_negociacao === 'lead')
    ).length
  };

  const handleReprocess = async () => {
    try {
      setReprocessing(true);
      const result = await onReprocess();
      
      toast({
        title: 'Reprocessamento concluído',
        description: `Processados: ${result?.processed || 0} | Atualizados: ${result?.updated || 0}`
      });
    } catch (err: any) {
      toast({
        title: 'Erro no reprocessamento',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setReprocessing(false);
    }
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Debug Dashboard - Sincronização de Vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.leadsHoje}</div>
            <div className="text-sm text-muted-foreground">Leads Hoje</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.vendasWebhook}</div>
            <div className="text-sm text-muted-foreground">Vendas Webhook</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.vendasSistema}</div>
            <div className="text-sm text-muted-foreground">Vendas Sistema</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.leadsPagosDesatualizados + stats.leadsWebhookSemStatus}
            </div>
            <div className="text-sm text-muted-foreground">Dessincronizados</div>
          </div>
        </div>
        
        {(stats.leadsPagosDesatualizados > 0 || stats.leadsWebhookSemStatus > 0) && (
          <div className="flex flex-wrap gap-2">
            {stats.leadsPagosDesatualizados > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Clock className="h-3 w-3" />
                {stats.leadsPagosDesatualizados} leads pagos com status desatualizado
              </Badge>
            )}
            {stats.leadsWebhookSemStatus > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.leadsWebhookSemStatus} webhooks sem status
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReprocess}
            disabled={reprocessing}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${reprocessing ? 'animate-spin' : ''}`} />
            {reprocessing ? 'Reprocessando...' : 'Reprocessar Hoje'}
          </Button>
          
          {stats.vendasWebhook === stats.vendasSistema && stats.leadsPagosDesatualizados === 0 && (
            <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3" />
              Sincronizado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}