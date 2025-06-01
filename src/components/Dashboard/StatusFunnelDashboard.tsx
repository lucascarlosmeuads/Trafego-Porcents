import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AdminDashboardMetrics } from '@/components/AdminDashboard/AdminDashboardMetrics'
import { useManagerData } from '@/hooks/useManagerData'
import { supabase } from '@/lib/supabase'

export function StatusFunnelDashboard() {
  const [loading, setLoading] = useState(true)
  const [allClientes, setAllClientes] = useState<any[]>([])
  
  // Função para determinar se uma comissão é considerada pendente
  const isComissaoPendente = (comissao: string | null | undefined): boolean => {
    // Considera pendente: null, undefined, string vazia, "Pendente", ou qualquer valor que não seja "Pago"
    if (!comissao || comissao.trim() === '' || comissao === 'Pendente') {
      return true
    }
    // Valores numéricos como "20", "60" etc também são considerados pendentes (valores antigos)
    if (/^\d+(\.\d+)?$/.test(comissao.trim())) {
      return true
    }
    // Qualquer coisa que não seja explicitamente "Pago" é considerada pendente
    return comissao.trim() !== 'Pago'
  }

  // Buscar todos os clientes para o dashboard geral
  useEffect(() => {
    const fetchAllClientes = async () => {
      try {
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [StatusFunnelDashboard] Erro ao buscar clientes:', error)
        } else {
          setAllClientes(data || [])
        }
      } catch (error) {
        console.error('❌ [StatusFunnelDashboard] Erro inesperado:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllClientes()

    // Configurar realtime para atualizações
    const channel = supabase
      .channel('admin-dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes'
        },
        (payload) => {
          console.log('🔄 [StatusFunnelDashboard] Atualização detectada:', payload)
          fetchAllClientes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Dados para o gráfico de status
  const statusData = allClientes.reduce((acc, cliente) => {
    const status = cliente.status_campanha || 'Não definido'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(statusData).map(([status, count]) => ({
    status,
    count
  }))

  // Dados para o gráfico de comissões - usando nova lógica corrigida
  const comissaoData = [
    {
      name: 'Pendentes',
      value: allClientes.filter(c => isComissaoPendente(c.comissao)).length,
      color: '#ef4444'
    },
    {
      name: 'Pagos',
      value: allClientes.filter(c => c.comissao === 'Pago').length,
      color: '#22c55e'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-contrast">Dashboard Administrativo</h1>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="text-sm"
        >
          🔄 Atualizar Dados
        </Button>
      </div>

      {/* Métricas principais */}
      <AdminDashboardMetrics clientes={allClientes} selectedManager={null} />

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={comissaoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {comissaoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
