
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { 
  Calculator,
  TrendingDown,
  TrendingUp,
  Percent,
  Users,
  Building,
  DollarSign
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
  const custoGestores = vendasDia > 0 ? (vendasDia / 350) * 100 : 0 // R$ 100 por venda (assumindo R$ 350 por venda)
  const custoComissao = vendasDia > 0 ? (vendasDia / 350) * 40 : 0 // R$ 40 por venda
  const custoImposto = vendasDia * 0.19 // 19% das vendas
  
  // Total de custos
  const totalCustos = investimentoTrafego + custoAppMax + custoGestores + custoComissao + custoImposto
  
  // Lucro líquido
  const lucroLiquido = vendasDia - totalCustos

  const custos = [
    {
      label: 'Investimento Tráfego',
      valor: investimentoTrafego,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'App Max (2%)',
      valor: custoAppMax,
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Gestores (R$ 100/venda)',
      valor: custoGestores,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Comissão (R$ 40/venda)',
      valor: custoComissao,
      icon: Calculator,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Imposto (19%)',
      valor: custoImposto,
      icon: Percent,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Relatório de Custos e Lucro
        </h3>
        <p className="text-sm text-muted-foreground">
          Análise detalhada dos custos operacionais do dia
        </p>
      </div>

      {/* Custos Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {custos.map((custo, index) => {
          const Icon = custo.icon
          return (
            <Card key={index} className={`${custo.bgColor} border-l-4 border-l-current`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{custo.label}</CardTitle>
                <Icon className={`h-4 w-4 ${custo.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${custo.color}`}>
                  {loadingVendas ? '...' : formatCurrency(custo.valor)}
                </div>
                {custo.label.includes('(') && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {custo.label.includes('2%') && `${custoAppMax > 0 ? '2% de ' + formatCurrency(vendasDia) : 'Sem vendas'}`}
                    {custo.label.includes('R$ 100') && `${Math.round(vendasDia / 350)} vendas × R$ 100`}
                    {custo.label.includes('R$ 40') && `${Math.round(vendasDia / 350)} vendas × R$ 40`}
                    {custo.label.includes('19%') && `${custoImposto > 0 ? '19% de ' + formatCurrency(vendasDia) : 'Sem vendas'}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resumo Final */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de Vendas */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingVendas ? '...' : formatCurrency(vendasDia)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Receita bruta do dia
            </p>
          </CardContent>
        </Card>

        {/* Total de Custos */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Custos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loadingVendas ? '...' : formatCurrency(totalCustos)}
            </div>
            <p className="text-xs text-red-700 mt-1">
              Soma de todos os custos
            </p>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card className={`${lucroLiquido >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            {lucroLiquido >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {loadingVendas ? '...' : formatCurrency(lucroLiquido)}
            </div>
            <p className={`text-xs mt-1 ${lucroLiquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
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
  )
}
