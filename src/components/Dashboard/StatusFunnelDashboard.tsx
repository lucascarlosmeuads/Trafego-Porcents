import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatusCount {
  status: string
  count: number
  color: string
  icon: React.ReactNode
}

interface GestorOption {
  nome: string
  email: string
}

export function StatusFunnelDashboard() {
  const { isAdmin } = useSimpleAuth()
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [gestores, setGestores] = useState<GestorOption[]>([])
  const [selectedGestor, setSelectedGestor] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [totalClientes, setTotalClientes] = useState(0)

  const statusConfig = [
    { 
      status: 'Sem Status', 
      dbStatus: null, 
      color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      status: 'Brief', 
      dbStatus: 'Brief', 
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: <TrendingUp className="w-4 h-4" />
    },
    { 
      status: 'Criativo', 
      dbStatus: 'Criativo', 
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <TrendingUp className="w-4 h-4" />
    },
    { 
      status: 'Site', 
      dbStatus: 'Site', 
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: <TrendingUp className="w-4 h-4" />
    },
    { 
      status: 'Agendamento', 
      dbStatus: 'Agendamento', 
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      icon: <TrendingUp className="w-4 h-4" />
    },
    { 
      status: 'No Ar', 
      dbStatus: 'No Ar', 
      color: 'bg-green-500/20 text-green-300 border-green-500/30',
      icon: <CheckCircle className="w-4 h-4" />
    },
    { 
      status: 'Otimização', 
      dbStatus: 'Otimização', 
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle className="w-4 h-4" />
    },
    { 
      status: 'Reembolso', 
      dbStatus: 'Reembolso', 
      color: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    { 
      status: 'Off', 
      dbStatus: 'Off', 
      color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      icon: <AlertTriangle className="w-4 h-4" />
    }
  ]

  const fetchGestores = async () => {
    if (!isAdmin) return

    try {
      const { data: gestoresData } = await supabase
        .from('gestores')
        .select('nome, email')
        .eq('ativo', true)
        .order('nome')

      setGestores(gestoresData || [])
    } catch (error) {
      console.error('Erro ao buscar gestores:', error)
    }
  }

  const fetchStatusCounts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('todos_clientes')
        .select('status_campanha, email_gestor')

      // Filtrar por gestor se selecionado
      if (selectedGestor !== 'todos') {
        query = query.eq('email_gestor', selectedGestor)
      }

      const { data } = await query

      if (!data) return

      setTotalClientes(data.length)

      // Contar clientes por status
      const counts = statusConfig.map(config => {
        let count = 0
        
        if (config.dbStatus === null) {
          // Contar clientes sem status ou com status vazio
          count = data.filter(cliente => 
            !cliente.status_campanha || 
            cliente.status_campanha.trim() === ''
          ).length
        } else {
          count = data.filter(cliente => 
            cliente.status_campanha === config.dbStatus
          ).length
        }

        return {
          status: config.status,
          count,
          color: config.color,
          icon: config.icon
        }
      })

      setStatusCounts(counts)
    } catch (error) {
      console.error('Erro ao buscar contagem de status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchGestores()
    }
    fetchStatusCounts()
  }, [isAdmin, selectedGestor])

  const maxCount = Math.max(...statusCounts.map(s => s.count))

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard - Funil de Status</h2>
          <p className="text-gray-400">Visualização estratégica dos clientes por etapa</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Select value={selectedGestor} onValueChange={setSelectedGestor}>
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Filtrar por gestor" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="todos">Todos os Gestores</SelectItem>
                {gestores.map((gestor) => (
                  <SelectItem key={gestor.email} value={gestor.email}>
                    {gestor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button
            onClick={fetchStatusCounts}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-card border-border hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalClientes}</div>
              <div className="text-sm text-gray-400">Total de Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {statusCounts.find(s => s.status === 'No Ar')?.count || 0}
              </div>
              <div className="text-sm text-gray-400">Campanhas No Ar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {statusCounts.filter(s => 
                  ['Brief', 'Criativo', 'Site', 'Agendamento'].includes(s.status)
                ).reduce((sum, s) => sum + s.count, 0)}
              </div>
              <div className="text-sm text-gray-400">Em Andamento</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funil de Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Funil de Status dos Clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusCounts.map((statusData, index) => {
            const percentage = totalClientes > 0 ? (statusData.count / totalClientes) * 100 : 0
            const barWidth = maxCount > 0 ? (statusData.count / maxCount) * 100 : 0

            return (
              <div key={statusData.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-md border ${statusData.color}`}>
                      {statusData.icon}
                      <span className="font-medium">{statusData.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-muted text-white">
                      {statusData.count} clientes
                    </Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-white">Carregando dados...</span>
        </div>
      )}
    </div>
  )
}
