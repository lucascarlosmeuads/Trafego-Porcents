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
  TrendingDown,
  DollarSign,
  Calculator,
  PieChart,
  Building,
  Percent,
  Users,
  CreditCard,
  BarChart3,
  Search,
  CheckCircle2,
  PiggyBank
} from 'lucide-react';
import { 
  getDateRangeFromPresetBrazil, 
  getTodayBrazil
} from '@/utils/timezoneUtils';

interface LeadsMetaAdsReportProps {
  convertedLeads: number;
  totalLeads: number;
  conversionRate: number;
}

export function LeadsMetaAdsReport({ convertedLeads, totalLeads, conversionRate }: LeadsMetaAdsReportProps) {
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
  
  // Cálculos de custos operacionais específicos para leads de parceria
  const custoOperacionalLeads = receitaTotal * 0.05; // 5% da receita para operação de leads
  const custoProcessamento = receitaTotal * 0.03; // 3% para processamento/plataforma
  const custoGestao = convertedLeads * 10; // R$ 10 por lead convertido para gestão
  const custoImposto = receitaTotal * 0.15; // 15% de impostos sobre a receita
  
  // Total de custos operacionais (excluindo o investimento em tráfego)
  const totalCustosOperacionais = custoOperacionalLeads + custoProcessamento + custoGestao + custoImposto;
  
  // Total geral de custos
  const totalCustos = investimento + totalCustosOperacionais;
  
  // Lucro líquido final
  const lucroLiquido = receitaTotal - totalCustos;
  
  // Métricas calculadas
  const cac = convertedLeads > 0 ? investimento / convertedLeads : 0;
  const roi = investimento > 0 ? ((receitaTotal - investimento) / investimento) * 100 : 0;
  const roiGeral = totalCustos > 0 ? ((receitaTotal - totalCustos) / totalCustos) * 100 : 0;
  const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

  useEffect(() => {
    if (isConfigured) {
      fetchTodayInsights();
    }
  }, [isConfigured]);

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

  // Função para análise detalhada no console
  const verificarDados = () => {
    console.log('🔍 [ANÁLISE LEADS DETALHADA] === DADOS FINANCEIROS ===');
    console.log('📊 Total de leads:', totalLeads);
    console.log('✅ Leads convertidos:', convertedLeads);
    console.log('📈 Taxa de conversão:', conversionRate.toFixed(2) + '%');
    console.log('💰 Receita total:', formatCurrency(receitaTotal));
    console.log('💸 Investimento Meta Ads:', formatCurrency(investimento));
    console.log('🏢 Custos operacionais total:', formatCurrency(totalCustosOperacionais));
    console.log('💼 Lucro líquido:', formatCurrency(lucroLiquido));
    console.log('📊 CAC:', formatCurrency(cac));
    console.log('📈 ROI:', roi.toFixed(2) + '%');
    console.log('📊 Margem:', margemLucro.toFixed(2) + '%');
  };

  return (
    <div className="space-y-8">
      {/* Header Principal */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3 mb-2">
          <Activity className="h-6 w-6 text-blue-500" />
          Análise Financeira de Leads de Parceria
        </h3>
        <p className="text-muted-foreground">
          Breakdown completo de receitas, custos e lucro dos leads convertidos
        </p>
        <div className="mt-4">
          <Button 
            onClick={verificarDados}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Analisar Dados no Console
          </Button>
        </div>
      </div>

      {/* Filtro de datas */}
      <AdminMetaAdsDateFilter 
        onDateRangeChange={handleDateRangeChange}
        loading={fetchingInsights}
        lastFetchInfo={lastFetchInfo}
      />

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

      {/* SEÇÃO 1: RESUMO PRINCIPAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-emerald-500" />
          <h4 className="text-lg font-semibold text-foreground">Resumo Principal</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita Total */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                Receita Total
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(receitaTotal)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {convertedLeads} leads × R$ {VALOR_POR_LEAD_CONVERTIDO}
              </p>
            </CardContent>
          </Card>

          {/* Total de Custos */}
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Total Custos
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(totalCustos)}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Tráfego + Operacional
              </p>
            </CardContent>
          </Card>

          {/* Lucro Líquido */}
          <Card className={`border-l-4 ${lucroLiquido >= 0 
            ? 'border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20' 
            : 'border-l-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${lucroLiquido >= 0 
                ? 'text-blue-800 dark:text-blue-200' 
                : 'text-red-800 dark:text-red-200'
              }`}>
                Lucro Líquido
              </CardTitle>
              {lucroLiquido >= 0 ? (
                <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${lucroLiquido >= 0 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-red-700 dark:text-red-300'
              }`}>
                {formatCurrency(lucroLiquido)}
              </div>
              <p className={`text-xs mt-1 ${lucroLiquido >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-red-600 dark:text-red-400'
              }`}>
                {lucroLiquido >= 0 ? 'Lucro positivo 📈' : 'Prejuízo 📉'}
              </p>
              {receitaTotal > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Margem: {margemLucro.toFixed(1)}%
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 2: BREAKDOWN DE CUSTOS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-5 w-5 text-purple-500" />
          <h4 className="text-lg font-semibold text-foreground">Breakdown de Custos</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Investimento Tráfego */}
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                Tráfego Meta Ads
              </CardTitle>
              <Target className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(investimento)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Investimento principal
              </p>
            </CardContent>
          </Card>

          {/* Operação Leads */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Operação (5%)
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(custoOperacionalLeads)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                5% da receita
              </p>
            </CardContent>
          </Card>

          {/* Processamento */}
          <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                Plataforma (3%)
              </CardTitle>
              <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(custoProcessamento)}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                3% da receita
              </p>
            </CardContent>
          </Card>

          {/* Impostos */}
          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Impostos (15%)
              </CardTitle>
              <Percent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatCurrency(custoImposto)}
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                15% da receita
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 3: MÉTRICAS DE PERFORMANCE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-teal-500" />
          <h4 className="text-lg font-semibold text-foreground">Métricas de Performance</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CAC */}
          <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                CAC
              </CardTitle>
              <Calculator className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                {formatCurrency(cac)}
              </div>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                Custo por conversão
              </p>
            </CardContent>
          </Card>

          {/* ROI Tráfego */}
          <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                ROI Tráfego
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${roi >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {roi.toFixed(1)}%
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Retorno do tráfego
              </p>
            </CardContent>
          </Card>

          {/* ROI Geral */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                ROI Geral
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${roiGeral >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                {roiGeral.toFixed(1)}%
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Retorno total
              </p>
            </CardContent>
          </Card>

          {/* Taxa Conversão */}
          <Card className="border-l-4 border-l-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-800 dark:text-pink-200">
                Conversão
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                {conversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                {convertedLeads}/{totalLeads} leads
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 4: RESUMO DETALHADO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumo Detalhado da Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalLeads}</div>
              <div className="text-sm text-muted-foreground">Total de Leads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{convertedLeads}</div>
              <div className="text-sm text-muted-foreground">Leads Convertidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(VALOR_POR_LEAD_CONVERTIDO)}</div>
              <div className="text-sm text-muted-foreground">Valor por Lead</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div className="space-y-3">
              <h5 className="font-medium text-foreground">Análise de Custos</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo por lead total:</span>
                  <span className="font-medium">
                    {totalLeads > 0 ? formatCurrency(totalCustos / totalLeads) : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gestão por lead:</span>
                  <span className="font-medium">{formatCurrency(10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eficiência operacional:</span>
                  <span className="font-medium">
                    {totalLeads > 0 ? `${((totalCustosOperacionais / receitaTotal) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium text-foreground">Performance Financeira</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receita por lead:</span>
                  <span className="font-medium">
                    {totalLeads > 0 ? formatCurrency(receitaTotal / totalLeads) : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margem bruta:</span>
                  <span className={`font-medium ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {margemLucro.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Breakeven:</span>
                  <span className="font-medium">
                    {VALOR_POR_LEAD_CONVERTIDO > 0 ? Math.ceil(totalCustos / VALOR_POR_LEAD_CONVERTIDO) : 0} leads
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}