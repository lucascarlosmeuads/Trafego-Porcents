import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminMetaAds } from '@/hooks/useAdminMetaAds';
import { AdminMetaAdsDateFilter } from '@/components/AdminDashboard/AdminMetaAdsDateFilter';
import { formatCurrency } from '@/lib/utils';
import { 
  Activity,
  Target,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign,
  Calculator,
  PieChart
} from 'lucide-react';
import { 
  getDateRangeFromPresetBrazil, 
  getTodayBrazil
} from '@/utils/timezoneUtils';

interface LeadsMetaAdsReportProps {
  convertedLeads: number;
  totalLeads: number;
  conversionRate: number;
  dateFilter?: {startDate?: string, endDate?: string, option?: string};
}

export function LeadsMetaAdsReport({ convertedLeads, totalLeads, conversionRate, dateFilter }: LeadsMetaAdsReportProps) {
  const { 
    insights, 
    fetchingInsights, 
    lastError,
    isConfigured,
    fetchTodayInsights,
    fetchInsightsWithPeriod
  } = useAdminMetaAds();

  const [lastFetchInfo, setLastFetchInfo] = useState<string>('');
  const [campaignsInfo, setCampaignsInfo] = useState<{count: number, details?: string}>({count: 0});

  // Constantes para cálculo de leads
  const VALOR_POR_LEAD_CONVERTIDO = 88.57;
  const receitaTotal = convertedLeads * VALOR_POR_LEAD_CONVERTIDO;
  const investimento = insights ? parseFloat(insights.spend || '0') : 0;
  const lucroLiquido = receitaTotal - investimento;
  const cac = convertedLeads > 0 ? investimento / convertedLeads : 0;
  const roi = investimento > 0 ? ((receitaTotal - investimento) / investimento) * 100 : 0;

  useEffect(() => {
    if (isConfigured && dateFilter) {
      // Sincronizar com o filtro da página pai
      if (dateFilter.option === 'hoje' || !dateFilter.option) {
        fetchTodayInsights();
      } else if (dateFilter.option === 'ontem') {
        fetchInsightsWithPeriod('yesterday');
      } else if (dateFilter.option === 'anteontem') {
        fetchInsightsWithPeriod('last_7_days'); // Usar last_7_days como aproximação
      } else if (dateFilter.option === 'personalizado' && dateFilter.startDate && dateFilter.endDate) {
        fetchInsightsWithPeriod('custom', dateFilter.startDate, dateFilter.endDate);
      }
    } else if (isConfigured) {
      fetchTodayInsights();
    }
  }, [isConfigured, dateFilter]);

  const handleDateRangeChange = async (startDate: string, endDate: string, preset?: string) => {
    setLastFetchInfo('');
    setCampaignsInfo({count: 0});
    
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    
    if (preset && preset !== 'custom') {
      const dateRange = getDateRangeFromPresetBrazil(preset);
      finalStartDate = dateRange.startDate;
      finalEndDate = dateRange.endDate;
    }
    
    if (preset === 'today') {
      const result = await fetchTodayInsights();
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || 'hoje'}`);
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        });
      }
    } else if (preset && preset !== 'custom') {
      const result = await fetchInsightsWithPeriod(preset as any);
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${result.period_used || preset}`);
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        });
      } else {
        setLastFetchInfo('');
        setCampaignsInfo({count: 0});
      }
    } else if (preset === 'custom' && startDate && endDate) {
      const result = await fetchInsightsWithPeriod('custom' as any, startDate, endDate);
      if (result.success) {
        setLastFetchInfo(`Dados encontrados para: ${startDate} até ${endDate}`);
        setCampaignsInfo({
          count: result.campaigns_count || 0,
          details: `${result.campaigns_count || 0} campanha(s) processada(s)`
        });
      } else {
        setLastFetchInfo('');
        setCampaignsInfo({count: 0});
      }
    }
  };

  if (!isConfigured) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Análise Financeira de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Configure primeiro o Meta Ads</p>
            <p className="text-sm">Expanda a seção de configuração para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Análise Financeira de Leads
        </h3>
        <p className="text-sm text-muted-foreground">
          ROI e lucro dos leads de parceria convertidos
        </p>
      </div>


      {/* Informações sobre os dados */}
      {lastFetchInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-1">✅ {lastFetchInfo}</div>
            {campaignsInfo.details && (
              <div className="text-sm">
                📊 {campaignsInfo.details}
              </div>
            )}
            {insights && (
              <div className="text-sm mt-1">
                💰 Investimento total: {formatCurrency(parseFloat(insights.spend || '0'))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Status de erro */}
      {lastError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Erro ao buscar dados:</div>
            <div className="text-sm">{lastError}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de métricas financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita Total */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(receitaTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {convertedLeads} leads × R$ {VALOR_POR_LEAD_CONVERTIDO}
            </p>
          </CardContent>
        </Card>

        {/* Investimento */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(investimento)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tráfego Meta Ads
            </p>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card className={`border-l-4 ${lucroLiquido >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lucroLiquido)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
            </p>
          </CardContent>
        </Card>

        {/* CAC */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              CAC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(cac)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Custo por lead convertido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumo da Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalLeads}</div>
              <div className="text-sm text-muted-foreground">Total de Leads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{convertedLeads}</div>
              <div className="text-sm text-muted-foreground">Leads Convertidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor por lead:</span>
                <span className="font-medium">R$ {VALOR_POR_LEAD_CONVERTIDO}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eficiência:</span>
                <span className="font-medium">
                  {totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0}% conversão
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investimento por lead:</span>
                <span className="font-medium">
                  {totalLeads > 0 ? formatCurrency(investimento / totalLeads) : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margem de lucro:</span>
                <span className={`font-medium ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {receitaTotal > 0 ? ((lucroLiquido / receitaTotal) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}