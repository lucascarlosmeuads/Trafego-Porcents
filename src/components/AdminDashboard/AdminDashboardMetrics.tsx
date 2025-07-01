
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, DollarSign, Calendar, Award, RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react'
import { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface AdminDashboardMetricsProps {
  clientes: Cliente[]
  selectedManager: string | null
}

export function AdminDashboardMetrics({ clientes, selectedManager }: AdminDashboardMetricsProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [totalInDatabase, setTotalInDatabase] = useState<number | null>(null)
  const { toast } = useToast()

  // Verificar total real no banco de dados
  const checkDatabaseTotal = async () => {
    setRefreshing(true)
    try {
      const { count, error } = await supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Erro ao verificar total:', error)
        toast({
          title: "Erro",
          description: "Erro ao verificar total de clientes",
          variant: "destructive"
        })
      } else {
        setTotalInDatabase(count)
        console.log(`📊 [AdminDashboard] Total real no banco: ${count}`)
        
        if (count && count > clientes.length) {
          toast({
            title: "Discrepância Detectada",
            description: `Existem ${count} clientes no banco, mas apenas ${clientes.length} foram carregados. Recarregue a página.`,
            variant: "destructive"
          })
        } else {
          toast({
            title: "Dados Sincronizados",
            description: `Todos os ${count} clientes foram carregados corretamente.`,
            variant: "default"
          })
        }
      }
    } catch (error) {
      console.error('💥 Erro na verificação:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar dados",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const metrics = useMemo(() => {
    const totalClientes = clientes.length
    const clientesComVenda = clientes.filter(c => c.data_venda).length
    const clientesAtivos = clientes.filter(c => 
      c.status_campanha && !['Concluído', 'Cancelado'].includes(c.status_campanha)
    ).length
    
    const totalComissoes = clientes.reduce((sum, cliente) => {
      return sum + (Number(cliente.valor_comissao) || 60)
    }, 0)

    const comissoesPagas = clientes
      .filter(c => c.comissao_paga || c.comissao === 'Pago')
      .reduce((sum, cliente) => sum + (Number(cliente.valor_comissao) || 60), 0)

    const clientesHoje = clientes.filter(c => {
      if (!c.created_at) return false
      const hoje = new Date().toDateString()
      const clienteData = new Date(c.created_at).toDateString()
      return hoje === clienteData
    }).length

    // Estatísticas por gestor
    const gestorStats = clientes.reduce((acc, cliente) => {
      const gestor = cliente.email_gestor || 'Sem Gestor'
      if (!acc[gestor]) {
        acc[gestor] = { total: 0, ativos: 0, comissoes: 0 }
      }
      acc[gestor].total++
      if (cliente.status_campanha && !['Concluído', 'Cancelado'].includes(cliente.status_campanha)) {
        acc[gestor].ativos++
      }
      acc[gestor].comissoes += Number(cliente.valor_comissao) || 60
      return acc
    }, {} as Record<string, { total: number, ativos: number, comissoes: number }>)

    return {
      totalClientes,
      clientesComVenda,
      clientesAtivos,
      totalComissoes,
      comissoesPagas,
      clientesHoje,
      gestorStats
    }
  }, [clientes])

  const isDiscrepancy = totalInDatabase && totalInDatabase !== clientes.length
  const isFullyLoaded = totalInDatabase && totalInDatabase === clientes.length

  return (
    <div className="space-y-6">
      {/* Header com botão de verificação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas do Sistema</h2>
          <p className="text-muted-foreground">
            {selectedManager && selectedManager !== 'Todos os Gestores' && selectedManager !== 'Todos os Clientes'
              ? `Dados do gestor: ${selectedManager}`
              : 'Visão geral de todos os clientes'
            }
          </p>
        </div>
        <Button onClick={checkDatabaseTotal} disabled={refreshing} variant="outline">
          {refreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Database className="w-4 h-4 mr-2" />
          )}
          Verificar Total
        </Button>
      </div>

      {/* Status de carregamento */}
      <Card className={`${isFullyLoaded ? 'border-green-200 bg-green-50' : isDiscrepancy ? 'border-orange-200 bg-orange-50' : 'bg-blue-50 border-blue-200'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isFullyLoaded ? 'text-green-700' : isDiscrepancy ? 'text-orange-700' : 'text-blue-700'}`}>
            {isFullyLoaded ? (
              <CheckCircle className="w-5 h-5" />
            ) : isDiscrepancy ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            Status de Carregamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${isFullyLoaded ? 'text-green-700' : isDiscrepancy ? 'text-orange-700' : 'text-blue-700'}`}>
                {clientes.length}
              </div>
              <p className={`${isFullyLoaded ? 'text-green-600' : isDiscrepancy ? 'text-orange-600' : 'text-blue-600'}`}>
                clientes carregados
              </p>
            </div>
            {totalInDatabase && (
              <div className="text-right">
                <div className={`text-lg font-semibold ${isFullyLoaded ? 'text-green-700' : isDiscrepancy ? 'text-orange-700' : 'text-blue-700'}`}>
                  {totalInDatabase}
                </div>
                <p className={`text-sm ${isFullyLoaded ? 'text-green-600' : isDiscrepancy ? 'text-orange-600' : 'text-blue-600'}`}>
                  total no banco
                </p>
              </div>
            )}
          </div>
          
          {isFullyLoaded && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              ✅ Todos os clientes carregados corretamente
            </p>
          )}
          
          {isDiscrepancy && (
            <div className="mt-2">
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ Discrepância detectada: {totalInDatabase} no banco vs {clientes.length} carregados
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Recarregue a página para garantir que todos os dados sejam exibidos.
              </p>
            </div>
          )}
          
          {clientes.length >= 1000 && !totalInDatabase && (
            <p className="text-sm text-blue-600 mt-2">
              📊 Carregando grandes volumes - clique em "Verificar Total" para validar
            </p>
          )}
        </CardContent>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.clientesHoje} novos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.clientesAtivos / metrics.totalClientes) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalComissoes)}</div>
            <p className="text-xs text-muted-foreground">
              valor total gerado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.comissoesPagas)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.comissoesPagas / metrics.totalComissoes) * 100)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por gestor quando visualizando todos */}
      {(!selectedManager || selectedManager === 'Todos os Gestores' || selectedManager === 'Todos os Clientes') && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gestor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.gestorStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 10)
                .map(([gestor, stats]) => (
                <div key={gestor} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{gestor.replace('@trafegoporcents.com', '')}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.ativos} ativos de {stats.total} total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(stats.comissoes)}</p>
                    <p className="text-sm text-muted-foreground">em comissões</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
