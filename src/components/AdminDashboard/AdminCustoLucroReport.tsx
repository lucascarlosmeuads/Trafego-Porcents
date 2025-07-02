
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'
import { useVendasDia } from '@/hooks/useVendasDia'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Calculator,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface AdminCustoLucroReportProps {
  vendasDia?: number
  investimentoTrafego: number
  loadingVendas?: boolean
}

export function AdminCustoLucroReport({ 
  investimentoTrafego, 
  loadingVendas = false 
}: AdminCustoLucroReportProps) {
  const { data, refetch } = useVendasDia()

  const lucroOperacional = data.valorTotalVendas - data.comissaoTotal - data.custoGestorTotal - investimentoTrafego
  const margemLucro = data.valorTotalVendas > 0 ? (lucroOperacional / data.valorTotalVendas) * 100 : 0
  const roas = investimentoTrafego > 0 ? data.valorTotalVendas / investimentoTrafego : 0

  const isLoading = data.loading || loadingVendas

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Relatório de Custos vs Lucro - Hoje
          </h3>
          <p className="text-sm text-muted-foreground">
            Análise financeira baseada em dados reais
          </p>
        </div>
        <Button 
          onClick={refetch} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Erro */}
      {data.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Erro ao carregar dados:</div>
            <div className="text-sm">{data.error}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💰 Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : formatCurrency(data.valorTotalVendas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? '...' : `${data.numeroVendas} vendas realizadas`}
            </p>
          </CardContent>
        </Card>

        {/* Investimento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📈 Investimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(investimentoTrafego)}
            </div>
            <p className="text-xs text-muted-foreground">
              Meta Ads + Outros
            </p>
          </CardContent>
        </Card>

        {/* Comissões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💸 Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : formatCurrency(data.comissaoTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? '...' : `${data.numeroVendas} × comissão`}
            </p>
          </CardContent>
        </Card>

        {/* Custo Gestores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">👥 Custo Gestores</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : formatCurrency(data.custoGestorTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? '...' : `${data.numeroVendas} × R$ 100`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Lucro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lucro Operacional */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📊 Lucro Operacional</CardTitle>
            {lucroOperacional >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isLoading ? '...' : formatCurrency(lucroOperacional)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas - Custos Totais
            </p>
          </CardContent>
        </Card>

        {/* Margem de Lucro */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📈 Margem de Lucro</CardTitle>
            <Badge variant={margemLucro >= 20 ? 'default' : margemLucro >= 10 ? 'secondary' : 'destructive'}>
              {isLoading ? '...' : `${margemLucro.toFixed(1)}%`}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${margemLucro >= 20 ? 'text-green-600' : margemLucro >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {isLoading ? '...' : `${margemLucro.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {margemLucro >= 20 ? 'Excelente' : margemLucro >= 10 ? 'Bom' : 'Atenção'}
            </p>
          </CardContent>
        </Card>

        {/* ROAS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🎯 ROAS</CardTitle>
            <Badge variant={roas >= 3 ? 'default' : roas >= 2 ? 'secondary' : 'destructive'}>
              {isLoading ? '...' : `${roas.toFixed(2)}x`}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${roas >= 3 ? 'text-green-600' : roas >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
              {isLoading ? '...' : `${roas.toFixed(2)}x`}
            </div>
            <p className="text-xs text-muted-foreground">
              Retorno sobre investimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Resumo Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Faturamento Total:</span>
              <span className="font-semibold text-green-600">
                {isLoading ? '...' : formatCurrency(data.valorTotalVendas)}
              </span>
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">(-) Investimento Tráfego:</span>
                <span className="text-blue-600">{formatCurrency(investimentoTrafego)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">(-) Comissões:</span>
                <span className="text-orange-600">
                  {isLoading ? '...' : formatCurrency(data.comissaoTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">(-) Custo Gestores:</span>
                <span className="text-purple-600">
                  {isLoading ? '...' : formatCurrency(data.custoGestorTotal)}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Lucro Líquido:</span>
                <span className={`font-bold text-lg ${lucroOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? '...' : formatCurrency(lucroOperacional)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
