
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { 
  Calculator,
  TrendingDown,
  TrendingUp,
  Percent,
  Users,
  Building,
  DollarSign,
  Target,
  PiggyBank,
  CreditCard
} from 'lucide-react'

interface AdminCustoLucroReportProps {
  vendasDia: number
  investimentoTrafego: number
  loadingVendas: boolean
}

export function AdminCustoLucroReport({ 
  vendasDia, 
  investimentoTrafego, 
  loadingVendas 
}: AdminCustoLucroReportProps) {
  
  // Calcular custos baseado nas vendas
  const custoAppMax = vendasDia * 0.02 // 2% das vendas
  const custoGestores = vendasDia > 0 ? (vendasDia / 350) * 100 : 0 // R$ 100 por venda
  const custoComissao = vendasDia > 0 ? (vendasDia / 350) * 40 : 0 // R$ 40 por venda
  const custoImposto = vendasDia * 0.19 // 19% das vendas
  
  // Total de custos
  const totalCustos = investimentoTrafego + custoAppMax + custoGestores + custoComissao + custoImposto
  
  // Lucro líquido
  const lucroLiquido = vendasDia - totalCustos

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3 mb-2">
          <Calculator className="h-6 w-6 text-blue-500" />
          Relatório de Custos e Lucro
        </h3>
        <p className="text-muted-foreground">
          Análise financeira detalhada das operações do dia
        </p>
      </div>

      {/* SEÇÃO 1: RESUMO PRINCIPAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-500" />
          <h4 className="text-lg font-semibold text-foreground">Resumo Principal</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total de Vendas */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                Total Vendas
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {loadingVendas ? '...' : formatCurrency(vendasDia)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Receita bruta do dia
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
                {loadingVendas ? '...' : formatCurrency(totalCustos)}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Soma de todos os custos
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
                {loadingVendas ? '...' : formatCurrency(lucroLiquido)}
              </div>
              <p className={`text-xs mt-1 ${lucroLiquido >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-red-600 dark:text-red-400'
              }`}>
                {lucroLiquido >= 0 ? 'Lucro positivo 📈' : 'Prejuízo 📉'}
              </p>
              {!loadingVendas && vendasDia > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Margem: {((lucroLiquido / vendasDia) * 100).toFixed(1)}%
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 2: CUSTOS OPERACIONAIS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-5 w-5 text-purple-500" />
          <h4 className="text-lg font-semibold text-foreground">Custos Operacionais</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Investimento Tráfego */}
          <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                Investimento Tráfego
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {loadingVendas ? '...' : formatCurrency(investimentoTrafego)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Custo com Meta Ads
              </p>
            </CardContent>
          </Card>

          {/* App Max */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
                App Max (2%)
              </CardTitle>
              <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {loadingVendas ? '...' : formatCurrency(custoAppMax)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {custoAppMax > 0 ? `2% de ${formatCurrency(vendasDia)}` : 'Sem vendas'}
              </p>
            </CardContent>
          </Card>

          {/* Imposto */}
          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Imposto (19%)
              </CardTitle>
              <Percent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {loadingVendas ? '...' : formatCurrency(custoImposto)}
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {custoImposto > 0 ? `19% de ${formatCurrency(vendasDia)}` : 'Sem vendas'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 3: PAGAMENTOS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-indigo-500" />
          <h4 className="text-lg font-semibold text-foreground">Pagamentos</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gestores */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Gestores (R$ 100/venda)
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {loadingVendas ? '...' : formatCurrency(custoGestores)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {Math.round(vendasDia / 350)} vendas × R$ 100
              </p>
            </CardContent>
          </Card>

          {/* Comissão */}
          <Card className="border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-800 dark:text-teal-200">
                Comissão (R$ 40/venda)
              </CardTitle>
              <Calculator className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {loadingVendas ? '...' : formatCurrency(custoComissao)}
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                {Math.round(vendasDia / 350)} vendas × R$ 40
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
