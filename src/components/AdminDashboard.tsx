
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ClientesTable } from './ClientesTable'

interface AdminDashboardProps {
  selectedManager: string
}

export function AdminDashboard({ selectedManager }: AdminDashboardProps) {
  const [managerStats, setManagerStats] = useState({
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
    fetchManagerStats()
  }, [selectedManager])

  const fetchManagerStats = async () => {
    try {
      setLoading(true)
      const tableName = getTableName(selectedManager)
      console.log(`Buscando estatísticas da tabela: ${tableName}`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')

      if (!error && data) {
        console.log(`Dados encontrados para ${selectedManager}:`, data.length, 'registros')
        
        const totalClientes = data.length
        const clientesAtivos = data.filter(item => item.status_campanha === 'No Ar' || item.status_campanha === 'Otimização').length
        
        // Contar status
        const statusCounts: {[key: string]: number} = {}
        statusList.forEach(status => {
          statusCounts[status.key] = 0
        })

        data.forEach(cliente => {
          const status = cliente.status_campanha || 'Formulário'
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++
          } else {
            statusCounts['Formulário']++
          }
        })
        
        // Calcular comissão total
        const comissaoTotal = data.reduce((total, cliente) => {
          const comissao = cliente.comissao ? parseFloat(cliente.comissao.replace(/[^\d,]/g, '').replace(',', '.')) : 0
          return total + comissao
        }, 0)

        console.log(`Estatísticas de ${selectedManager}:`, { totalClientes, clientesAtivos, comissaoTotal })
        console.log('Estatísticas por status:', statusCounts)
        
        setManagerStats({
          totalClientes,
          clientesAtivos,
          comissaoTotal
        })
        setStatusStats(statusCounts)
      } else if (error) {
        console.error(`Erro ao buscar dados de ${selectedManager}:`, error)
      }
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

  const exportManagerData = async () => {
    try {
      const tableName = getTableName(selectedManager)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')

      if (!error && data) {
        if (data.length === 0) {
          toast({
            title: "Aviso",
            description: "Nenhum dado encontrado para exportar",
          })
          return
        }

        const headers = [
          'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 
          'Vendedor', 'Comissão', 'Email Gestor', 'Status Campanha', 'Data Limite', 
          'Data Subida', 'Link Grupo', 'Link Briefing', 'Link Criativo', 
          'Link Site', 'Número BM'
        ]

        const csvData = data.map(cliente => [
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
        link.setAttribute('download', `relatorio_${selectedManager.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Sucesso",
          description: `Relatório de ${selectedManager} exportado com sucesso`
        })
      }
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
          <span>Carregando dados de {selectedManager}...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Header com ações */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">Dashboard - {selectedManager}</h2>
                </div>
                <div className="flex gap-2">
                  <Button onClick={fetchManagerStats} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button onClick={exportManagerData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
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
                <CardTitle className="text-sm font-medium text-gray-600">Comissão Total</CardTitle>
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

          {/* Resumo por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Status - {selectedManager}</CardTitle>
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
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <ClientesTable selectedManager={selectedManager} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
