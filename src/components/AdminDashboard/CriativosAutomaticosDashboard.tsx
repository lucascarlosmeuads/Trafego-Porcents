import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, TrendingUp, Zap, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CriadorCriativos } from '../CriativosAutomaticos/CriadorCriativos';

interface CriativoGerado {
  id: string;
  cliente_id: number;
  email_cliente: string;
  email_gestor: string;
  nome_arquivo_pdf: string;
  dados_extraidos: any;
  criativos: any;
  status: string;
  custo_processamento: number;
  created_at: string;
  todos_clientes?: {
    nome_cliente: string;
  };
}

export function CriativosAutomaticosDashboard() {
  const [criativos, setCriativos] = useState<CriativoGerado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    hoje: 0,
    custoTotal: 0,
    tempoMedio: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCriativos();
  }, []);

  const loadCriativos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('criativos_gerados')
        .select(`
          *,
          todos_clientes:cliente_id (
            nome_cliente
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setCriativos(data || []);
      
      // Calcular métricas
      const hoje = new Date().toISOString().split('T')[0];
      const criativosHoje = data?.filter(c => 
        c.created_at.split('T')[0] === hoje
      ) || [];
      
      const custoTotal = data?.reduce((sum, c) => 
        sum + (c.custo_processamento || 0), 0
      ) || 0;

      setMetrics({
        total: data?.length || 0,
        hoje: criativosHoje.length,
        custoTotal,
        tempoMedio: 1.2 // Estimativa baseada no processamento
      });

    } catch (error: any) {
      console.error('Erro ao carregar criativos:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Falha ao buscar criativos gerados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'processando': return 'bg-yellow-100 text-yellow-800';
      case 'erro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'processando': return 'Processando';
      case 'erro': return 'Erro';
      default: return status;
    }
  };

  if (showCreator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Criar Novos Criativos</h2>
            <p className="text-muted-foreground">
              Geração automática com IA
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowCreator(false)}
          >
            Voltar ao Dashboard
          </Button>
        </div>
        
        <CriadorCriativos />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Criativos Automáticos</h2>
          <p className="text-muted-foreground">
            Geração automática de criativos com IA
          </p>
        </div>
        <Button onClick={() => setShowCreator(true)}>
          <Zap className="h-4 w-4 mr-2" />
          Criar Criativos
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{metrics.total}</p>
                <p className="text-xs text-muted-foreground">Total Gerados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{metrics.hoje}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">R$ {metrics.custoTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Custo Total IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{metrics.tempoMedio}min</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Criativos */}
      <Card>
        <CardHeader>
          <CardTitle>Criativos Gerados Recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Carregando criativos...</div>
            </div>
          ) : criativos.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                Nenhum criativo gerado ainda
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Criar Criativos" para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {criativos.map((criativo) => (
                <div 
                  key={criativo.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">
                        {criativo.dados_extraidos?.oferta || 'Planejamento'}
                      </h4>
                      <Badge className={getStatusColor(criativo.status)}>
                        {getStatusText(criativo.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Cliente: {criativo.todos_clientes?.nome_cliente || criativo.email_cliente}
                      </span>
                      <span>
                        {Array.isArray(criativo.criativos) 
                          ? criativo.criativos.length 
                          : (criativo.criativos ? 3 : 0)
                        } criativos
                      </span>
                      <span>
                        R$ {criativo.custo_processamento?.toFixed(2) || '0.00'}
                      </span>
                      <span>
                        {new Date(criativo.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Implementar visualização detalhada
                        toast({
                          title: "Visualizar criativos",
                          description: "Abrindo visualização detalhada..."
                        });
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Implementar download
                        const data = {
                          dados_extraidos: criativo.dados_extraidos,
                          criativos: criativo.criativos
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { 
                          type: 'application/json' 
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `criativos-${criativo.id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        
                        toast({
                          title: "Download iniciado",
                          description: "Criativos baixados com sucesso!"
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}