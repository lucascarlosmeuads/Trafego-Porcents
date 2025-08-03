import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Mic,
  FileText,
  BarChart3,
  Minus,
  Search,
  DollarSign,
  PieChart,
  Target,
  Percent
} from 'lucide-react';
import { useLeadsAnalytics } from '@/hooks/useLeadsAnalytics';
import { LeadsMetaAdsReport } from './LeadsMetaAdsReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';



export function LeadsParcerriaAnalytics() {
  const {
    todayStats,
    yesterdayStats,
    dayBeforeStats,
    customDateStats,
    
    loading,
    getTrend,
    getTrendPercentage,
    fetchCustomDateAnalytics,
  } = useLeadsAnalytics();

  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomFilter, setShowCustomFilter] = useState(false);

  const handleCustomDateSearch = () => {
    if (customStartDate && customEndDate) {
      fetchCustomDateAnalytics({
        startDate: customStartDate,
        endDate: customEndDate
      });
    }
  };


  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderTrendBadge = (current: number, previous: number, label: string) => {
    const trend = getTrend(current, previous);
    const percentage = getTrendPercentage(current, previous);
    
    if (trend === 'stable') {
      return (
        <Badge variant="secondary" className="text-xs">
          Estável
        </Badge>
      );
    }

    return (
      <Badge 
        variant={trend === 'up' ? 'default' : 'destructive'} 
        className="text-xs flex items-center gap-1"
      >
        {renderTrendIcon(trend)}
        {Math.abs(percentage)}%
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Carregando analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de filtro personalizado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics de Leads
          </h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho dos seus leads de parceria
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCustomFilter(!showCustomFilter)}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Filtro Personalizado
        </Button>
      </div>

      {/* Filtro de data personalizada */}
      {showCustomFilter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Período Personalizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Data Inicial</label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Data Final</label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleCustomDateSearch}
                disabled={!customStartDate || !customEndDate}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de métricas principais - Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hoje */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Hoje
              </span>
              {yesterdayStats && todayStats && (
                renderTrendBadge(todayStats.total, yesterdayStats.total, 'hoje vs ontem')
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{todayStats?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Ontem */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Ontem
              </span>
              {dayBeforeStats && yesterdayStats && (
                renderTrendBadge(yesterdayStats.total, dayBeforeStats.total, 'ontem vs anteontem')
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{yesterdayStats?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Anteontem */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Anteontem
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{dayBeforeStats?.total || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Geral */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Últimos 3 Dias
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {(todayStats?.total || 0) + (yesterdayStats?.total || 0) + (dayBeforeStats?.total || 0)}
              </div>
              <div className="pt-1 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Média/Dia</span>
                  <span className="font-medium text-orange-600">
                    {Math.round(((todayStats?.total || 0) + (yesterdayStats?.total || 0) + (dayBeforeStats?.total || 0)) / 3 * 100) / 100}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de vendas diárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vendas Hoje */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Vendas Hoje
              </span>
              {yesterdayStats && todayStats && (
                renderTrendBadge(todayStats.converted, yesterdayStats.converted, 'vendas hoje vs ontem')
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">{todayStats?.converted || 0}</div>
              <div className="text-xs text-muted-foreground">
                Taxa: {todayStats?.conversionRate.toFixed(1) || '0.0'}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendas Ontem */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Vendas Ontem
              </span>
              {dayBeforeStats && yesterdayStats && (
                renderTrendBadge(yesterdayStats.converted, dayBeforeStats.converted, 'vendas ontem vs anteontem')
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-blue-600">{yesterdayStats?.converted || 0}</div>
              <div className="text-xs text-muted-foreground">
                Taxa: {yesterdayStats?.conversionRate.toFixed(1) || '0.0'}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendas Anteontem */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Vendas Anteontem
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-purple-600">{dayBeforeStats?.converted || 0}</div>
              <div className="text-xs text-muted-foreground">
                Taxa: {dayBeforeStats?.conversionRate.toFixed(1) || '0.0'}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Vendas 3 Dias */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                Total Vendas (3 dias)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-orange-600">
                {(todayStats?.converted || 0) + (yesterdayStats?.converted || 0) + (dayBeforeStats?.converted || 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Taxa média: {(() => {
                  const totalLeads = (todayStats?.total || 0) + (yesterdayStats?.total || 0) + (dayBeforeStats?.total || 0);
                  const totalConverted = (todayStats?.converted || 0) + (yesterdayStats?.converted || 0) + (dayBeforeStats?.converted || 0);
                  return totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '0.0';
                })()}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório Meta Ads */}
      {(todayStats || yesterdayStats || dayBeforeStats) && (
        <LeadsMetaAdsReport 
          convertedLeads={(todayStats?.converted || 0) + (yesterdayStats?.converted || 0) + (dayBeforeStats?.converted || 0)}
          totalLeads={(todayStats?.total || 0) + (yesterdayStats?.total || 0) + (dayBeforeStats?.total || 0)}
          conversionRate={(() => {
            const totalLeads = (todayStats?.total || 0) + (yesterdayStats?.total || 0) + (dayBeforeStats?.total || 0);
            const totalConverted = (todayStats?.converted || 0) + (yesterdayStats?.converted || 0) + (dayBeforeStats?.converted || 0);
            return totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;
          })()}
        />
      )}

      {/* Cards de métricas adicionais */}
      {(todayStats || yesterdayStats || dayBeforeStats) && (
        <div className="grid grid-cols-1 gap-6">
          {/* Tipos de Negócio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Tipos de Negócio (Últimos 3 Dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const todosTipos = { ...todayStats?.tiposNegocio, ...yesterdayStats?.tiposNegocio, ...dayBeforeStats?.tiposNegocio };
                  const tiposConsolidados: { [key: string]: number } = {};
                  
                  // Consolidar contagens
                  [todayStats, yesterdayStats, dayBeforeStats].forEach(stats => {
                    if (stats?.tiposNegocio) {
                      Object.entries(stats.tiposNegocio).forEach(([tipo, count]) => {
                        tiposConsolidados[tipo] = (tiposConsolidados[tipo] || 0) + count;
                      });
                    }
                  });

                  return Object.entries(tiposConsolidados).map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="capitalize">{tipo}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Status de Negociação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Status de Negociação (Últimos 3 Dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const statusConsolidados: { [key: string]: number } = {};
                  
                  // Consolidar contagens de status
                  [todayStats, yesterdayStats, dayBeforeStats].forEach(stats => {
                    if (stats?.statusBreakdown) {
                      Object.entries(stats.statusBreakdown).forEach(([status, count]) => {
                        statusConsolidados[status] = (statusConsolidados[status] || 0) + count;
                      });
                    }
                  });

                  // Traduzir status
                  const statusTraduzidos: { [key: string]: string } = {
                    'pendente': 'Não chamei',
                    'chamei': 'Chamei',
                    'aceitou': 'Comprou',
                    'comprou': 'Comprou',
                    'recusou': 'Não quer',
                    'pensando': 'Pensando'
                  };

                  return Object.entries(statusConsolidados).map(([status, count]) => {
                    const statusDisplay = statusTraduzidos[status] || status;
                    const isConverted = ['aceitou', 'comprou'].includes(status);
                    
                    return (
                      <div key={status} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="capitalize">{statusDisplay}</span>
                        <Badge 
                          variant={isConverted ? "default" : "outline"}
                          className={isConverted ? "bg-green-100 text-green-800 border-green-300" : ""}
                        >
                          {count}
                        </Badge>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Card de período personalizado */}
      {customDateStats && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Período Personalizado
            </CardTitle>
            <p className="text-sm text-muted-foreground">{customDateStats.date}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{customDateStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{customDateStats.converted}</div>
                <div className="text-sm text-muted-foreground">Convertidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{customDateStats.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Taxa Conversão</div>
              </div>
            </div>
            
            {/* Tipos de negócio no período personalizado */}
            {Object.keys(customDateStats.tiposNegocio).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Tipos de Negócio</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(customDateStats.tiposNegocio).map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="capitalize text-sm">{tipo}</span>
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}