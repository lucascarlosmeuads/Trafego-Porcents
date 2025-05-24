
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ClientesTable } from './ClientesTable'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export function GestorDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, loading, refetch } = useManagerData(user?.email || '', false)
  const [managerStats, setManagerStats] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    comissaoTotal: 0
  })
  const [statusStats, setStatusStats] = useState<{[key: string]: number}>({})
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preenchimento do Formulário':
        return 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
      case 'Brief':
        return 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
      case 'Criativo':
        return 'bg-purple-500/20 text-purple-700 border border-purple-500/30'
      case 'Site':
        return 'bg-orange-500/20 text-orange-700 border border-orange-500/30'
      case 'Agendamento':
        return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
      case 'No Ar':
        return 'bg-green-500/20 text-green-700 border border-green-500/30'
      case 'Otimização':
        return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
      default:
        return 'bg-muted text-muted-foreground border border-border'
    }
  }

  // Recalcular estatísticas quando os clientes mudarem
  useEffect(() => {
    if (clientes && clientes.length >= 0) {
      const totalClientes = clientes.length
      const clientesAtivos = clientes.filter(item => 
        item.status_campanha === 'No Ar' || item.status_campanha === 'Otimização'
      ).length
      
      // Contar status
      const statusCounts: {[key: string]: number} = {}
      STATUS_CAMPANHA.forEach(status => {
        statusCounts[status] = 0
      })

      clientes.forEach(cliente => {
        const status = cliente.status_campanha || 'Preenchimento do Formulário'
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++
        } else {
          statusCounts['Preenchimento do Formulário']++
        }
      })
      
      // Calcular comissão total
      const comissaoTotal = clientes.reduce((total, cliente) => {
        const valor = cliente.valor_comissao ? parseFloat(String(cliente.valor_comissao)) : 60.00
        return total + valor
      }, 0)

      setManagerStats({
        totalClientes,
        clientesAtivos,
        comissaoTotal
      })
      setStatusStats(statusCounts)
    }
  }, [clientes])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const exportClientesData = async () => {
    try {
      if (clientes.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum dado encontrado para exportar",
        })
        return
      }

      console.log(`📊 Exportando ${clientes.length} registros`)

      const headers = [
        'Nome Cliente', 'Telefone', 'Email Cliente', 'Vendedor', 'Email Gestor', 
        'Status Campanha', 'Data Venda', 'Data Limite', 'Link Grupo', 'Link Briefing', 
        'Link Criativo', 'Link Site', 'Número BM', 'Comissão Paga', 'Valor Comissão'
      ]

      const csvData = clientes.map(cliente => [
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.vendedor || '',
        cliente.email_gestor || '',
        cliente.status_campanha || '',
        cliente.data_venda || '',
        cliente.data_limite || '',
        cliente.link_grupo || '',
        cliente.link_briefing || '', 
        cliente.link_criativo || '', 
        cliente.link_site || '', 
        cliente.numero_bm || '',
        cliente.comissao_paga ? 'Pago' : 'Não Pago',
        `R$ ${(cliente.valor_comissao || 60.00).toFixed(2)}`
      ])

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `meus_clientes_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Sucesso",
        description: `Relatório exportado com sucesso - ${clientes.length} registros`
      })
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Carregando seus dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clientes">Meus Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Header com ações */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">Meu Dashboard - {currentManagerName}</h2>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRefresh} 
                    variant="outline" 
                    size="sm"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                  <Button onClick={exportClientesData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Meus Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{managerStats.totalClientes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{managerStats.clientesAtivos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Minha Comissão Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {managerStats.comissaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {managerStats.totalClientes > 0 ? Math.round((managerStats.clientesAtivos / managerStats.totalClientes) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meus Clientes por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {STATUS_CAMPANHA.map(status => (
                  <div key={status} className={`p-4 rounded-lg ${getStatusColor(status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{status}</h3>
                      <span className="text-2xl font-bold">
                        {statusStats[status] || 0}
                      </span>
                    </div>
                    <p className="text-xs opacity-75">
                      {status === 'Preenchimento do Formulário' && 'Cliente adicionado, aguardando preenchimento'}
                      {status === 'Brief' && 'Cliente preencheu o formulário de briefing'}
                      {status === 'Criativo' && 'Criativos em produção ou em revisão'}
                      {status === 'Site' && 'Landing page sendo construída (opcional)'}
                      {status === 'Agendamento' && 'Campanha agendada, configurando BM (opcional)'}
                      {status === 'No Ar' && 'Campanha rodando, analisando resultados'}
                      {status === 'Otimização' && 'Otimizando anúncios e melhorando ROAS'}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Total de meus clientes:</span>
                  <span className="font-bold text-lg">
                    {Object.values(statusStats).reduce((sum, count) => sum + count, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <ClientesTable userEmail={user?.email || ''} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
