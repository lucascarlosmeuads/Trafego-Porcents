
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

const statusColors = {
  'Planejamento': '#3B82F6',
  'Brief': '#F59E0B',
  'Criativo': '#8B5CF6',
  'No Ar': '#10B981'
}

export function AdminDashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [gestorFilter, setGestorFilter] = useState('all')
  const [gestores, setGestores] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [])

  useEffect(() => {
    if (clientes.length > 0) {
      filterClientesByGestor()
      extractGestores()
    }
  }, [clientes, gestorFilter])

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive"
        })
      } else {
        setClientes(data || [])
        setFilteredClientes(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractGestores = () => {
    const uniqueGestores = Array.from(new Set(
      clientes
        .map(cliente => cliente.email_gestor_responsavel)
        .filter(email => email)
    )) as string[];
    
    setGestores(uniqueGestores);
  }

  const filterClientesByGestor = () => {
    if (gestorFilter === 'all') {
      setFilteredClientes(clientes)
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.email_gestor_responsavel === gestorFilter
      )
      setFilteredClientes(filtered)
    }
  }

  // Métricas por status
  const statusMetrics = Object.entries(
    filteredClientes.reduce((acc, cliente) => {
      const status = cliente.status_campanha || 'Sem Status'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status as keyof typeof statusColors] || '#6B7280'
  }))

  // Métricas por gestor
  const gestorMetrics = Object.entries(
    clientes.reduce((acc, cliente) => {
      // Use email_gestor_responsavel if email_gestor is not available
      const gestor = cliente.email_gestor || cliente.email_gestor_responsavel || 'Sem Gestor'
      acc[gestor] = (acc[gestor] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([gestor, count]) => ({
    gestor: gestor.split('@')[0],
    count
  }))

  const totalClientes = filteredClientes.length
  const clientesAtivos = filteredClientes.filter(c => c.status_campanha === 'No Ar').length
  const comissaoTotal = filteredClientes.reduce((total, cliente) => {
    // Handle case where comissao may not exist
    const comissao = cliente.comissao ? parseFloat(cliente.comissao.replace(/[^\d,]/g, '').replace(',', '.')) : 0
    return total + comissao
  }, 0)

  const exportToCSV = () => {
    const headers = [
      'ID', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 
      'Vendedor', 'Comissão', 'Email Gestor', 'Status Campanha', 'Data Limite', 
      'Data Subida', 'Link Grupo', 'Link Briefing', 'Link Criativo', 
      'Link Site', 'Número BM'
    ]

    const csvData = filteredClientes.map(cliente => [
      cliente.id,
      cliente.data_venda || '',
      cliente.nome_cliente || '',
      cliente.telefone || '',
      cliente.email_cliente || '',
      cliente.nome_vendedor || '',
      cliente.comissao || '',
      cliente.email_gestor_responsavel || '',
      cliente.status_campanha || '',
      cliente.data_limite || '',
      cliente.data_subida || '',
      cliente.link_grupo || '',
      cliente.link_reuniao_1 || '', 
      cliente.link_reuniao_2 || '', 
      cliente.link_reuniao_3 || '', 
      cliente.bm_identificacao || '' 
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_clientes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso"
    })
  }

  if (loading) {
    return <div className="text-center py-8">Carregando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filtro por gestor */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={gestorFilter} onValueChange={setGestorFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filtrar por gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gestores</SelectItem>
                  {gestores.map(gestor => (
                    <SelectItem key={gestor} value={gestor}>{gestor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório Geral
            </Button>
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
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Comissão Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {comissaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por Gestor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gestorMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gestor" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusMetrics.map(({ status, count, color }) => (
              <div key={status} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium">{status}</span>
                <span className="text-sm text-gray-600">({count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
