
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ClientesTable } from './ClientesTable'

export function AdminDashboard() {
  const [selectedManager, setSelectedManager] = useState('Andreza')
  const [managers, setManagers] = useState<string[]>(['Andreza', 'Lucas Falcão'])
  const [totalStats, setTotalStats] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    comissaoTotal: 0
  })
  const [statusStats, setStatusStats] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const getTableName = (managerName: string) => {
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    return tableMapping[managerName] || 'clientes_andreza'
  }

  // Os 7 status do processo
  const statusList = [
    { key: 'Formulário', label: 'Formulário', description: 'Aguardando preenchimento' },
    { key: 'Brief', label: 'Brief', description: 'Briefing preenchido' },
    { key: 'Criativo', label: 'Criativo', description: 'Criativos em produção' },
    { key: 'Site', label: 'Site', description: 'Landing page sendo criada' },
    { key: 'Agendamento', label: 'Agendamento', description: 'Campanha sendo agendada' },
    { key: 'No Ar', label: 'No Ar', description: 'Campanha rodando' },
    { key: 'Otimização', label: 'Otimização', description: 'Analisando e otimizando' }
  ]

  useEffect(() => {
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    try {
      setLoading(true)
      let totalClientes = 0
      let clientesAtivos = 0
      let comissaoTotal = 0
      const statusCounts: {[key: string]: number} = {}

      // Inicializar contadores de status
      statusList.forEach(status => {
        statusCounts[status.key] = 0
      })

      // Buscar dados de todas as tabelas dos gerentes
      for (const manager of managers) {
        const tableName = getTableName(manager)
        console.log(`Buscando estatísticas da tabela: ${tableName}`)
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')

        if (!error && data) {
          console.log(`Dados encontrados para ${manager}:`, data.length, 'registros')
          totalClientes += data.length
          clientesAtivos += data.filter(item => item.status_campanha === 'No Ar' || item.status_campanha === 'Otimização').length
          
          // Contar status
          data.forEach(cliente => {
            const status = cliente.status_campanha || 'Formulário'
            if (statusCounts.hasOwnProperty(status)) {
              statusCounts[status]++
            } else {
              // Se o status não está na lista, adicionar ao Formulário como fallback
              statusCounts['Formulário']++
            }
          })
          
          // Calcular comissão total
          const comissaoTabela = data.reduce((total, cliente) => {
            const comissao = cliente.comissao ? parseFloat(cliente.comissao.replace(/[^\d,]/g, '').replace(',', '.')) : 0
            return total + comissao
          }, 0)
          comissaoTotal += comissaoTabela
        } else if (error) {
          console.error(`Erro ao buscar dados de ${manager}:`, error)
        }
      }

      console.log('Estatísticas totais:', { totalClientes, clientesAtivos, comissaoTotal })
      console.log('Estatísticas por status:', statusCounts)
      
      setTotalStats({
        totalClientes,
        clientesAtivos,
        comissaoTotal
      })
      setStatusStats(statusCounts)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportAllData = async () => {
    try {
      const allData: any[] = []
      
      for (const manager of managers) {
        const tableName = getTableName(manager)
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')

        if (!error && data) {
          // Adicionar coluna do gerente aos dados
          const dataWithManager = data.map(item => ({
            ...item,
            gerente: manager
          }))
          allData.push(...dataWithManager)
        }
      }

      if (allData.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum dado encontrado para exportar",
        })
        return
      }

      const headers = [
        'Gerente', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 
        'Vendedor', 'Comissão', 'Email Gestor', 'Status Campanha', 'Data Limite', 
        'Data Subida', 'Link Grupo', 'Link Briefing', 'Link Criativo', 
        'Link Site', 'Número BM'
      ]

      const csvData = allData.map(cliente => [
        cliente.gerente || '',
        cliente.data_venda || '',
        cliente.nome_cliente || '',
        cliente.telefone || '',
        cliente.email_cliente || '',
        cliente.vendedor || '',
        cliente.comissao || '',
        cliente.email_gestor || '',
        cliente.status_campanha || '',
        cliente.data_limite || '',
        cliente.data_subida_campanha || '',
        cliente.link_grupo || '',
        cliente.link_briefing || '', 
        cliente.link_criativo || '', 
        cliente.link_site || '', 
        cliente.numero_bm || ''
      ])

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `relatorio_completo_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Sucesso",
        description: "Relatório completo exportado com sucesso"
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
          <span>Carregando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Resumo Geral</TabsTrigger>
          <TabsTrigger value="manager">Por Gerente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Header com filtro e exportação */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">Resumo Geral - Todos os Gerentes</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={fetchAllStats} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button onClick={exportAllData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Tudo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStats.totalClientes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalStats.clientesAtivos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Comissão Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {totalStats.comissaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {totalStats.totalClientes > 0 ? Math.round((totalStats.clientesAtivos / totalStats.totalClientes) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nova seção: Resumo por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Status - Todas as Etapas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {statusList.map(status => (
                  <div key={status.key} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{status.label}</h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {statusStats[status.key] || 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {status.description}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Resumo total na parte inferior */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Total de clientes em todas as etapas:</span>
                  <span className="font-bold text-lg">
                    {Object.values(statusStats).reduce((sum, count) => sum + count, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo por Gerente */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Gerente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {managers.map(manager => (
                  <ManagerSummary key={manager} managerName={manager} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manager" className="space-y-6">
          {/* Filtro por gerente */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecionar gerente" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map(manager => (
                      <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <ClientesTable selectedManager={selectedManager} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente para resumo individual de cada gerente
function ManagerSummary({ managerName }: { managerName: string }) {
  const [stats, setStats] = useState({ total: 0, ativos: 0, comissao: 0 })
  const [loading, setLoading] = useState(true)

  const getTableName = (managerName: string) => {
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    return tableMapping[managerName] || 'clientes_andreza'
  }

  useEffect(() => {
    fetchManagerStats()
  }, [managerName])

  const fetchManagerStats = async () => {
    try {
      const tableName = getTableName(managerName)
      console.log(`Buscando resumo para ${managerName} na tabela ${tableName}`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')

      if (!error && data) {
        const total = data.length
        const ativos = data.filter(item => item.status_campanha === 'No Ar' || item.status_campanha === 'Concluída').length
        const comissao = data.reduce((total, cliente) => {
          const comissaoValue = cliente.comissao ? parseFloat(cliente.comissao.replace(/[^\d,]/g, '').replace(',', '.')) : 0
          return total + comissaoValue
        }, 0)

        console.log(`Estatísticas de ${managerName}:`, { total, ativos, comissao })
        setStats({ total, ativos, comissao })
      } else {
        console.error(`Erro ao buscar dados de ${managerName}:`, error)
      }
    } catch (error) {
      console.error(`Erro ao buscar dados de ${managerName}:`, error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Carregando dados de {managerName}...</span>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-2">{managerName}</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Total: </span>
          <span className="font-bold">{stats.total}</span>
        </div>
        <div>
          <span className="text-gray-600">Ativos: </span>
          <span className="font-bold text-green-600">{stats.ativos}</span>
        </div>
        <div>
          <span className="text-gray-600">Comissão: </span>
          <span className="font-bold text-blue-600">
            R$ {stats.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}
