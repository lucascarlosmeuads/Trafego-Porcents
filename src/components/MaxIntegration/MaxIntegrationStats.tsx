
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MaxIntegrationLog } from '@/hooks/useMaxIntegration'
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react'

interface MaxIntegrationStatsProps {
  logs: MaxIntegrationLog[]
}

export function MaxIntegrationStats({ logs }: MaxIntegrationStatsProps) {
  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)

    // Filtrar logs por período
    const logsToday = logs.filter(log => 
      new Date(log.created_at).toDateString() === today
    )
    
    const logsThisWeek = logs.filter(log => 
      new Date(log.created_at) >= thisWeek
    )

    // Contar por status
    const countByStatus = (logsList: MaxIntegrationLog[]) => {
      return logsList.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    const todayStats = countByStatus(logsToday)
    const weekStats = countByStatus(logsThisWeek)

    return {
      today: {
        total: logsToday.length,
        sucesso: todayStats.sucesso || 0,
        erro: todayStats.erro || 0,
        processando: todayStats.processando || 0,
        duplicado: todayStats.duplicado || 0
      },
      week: {
        total: logsThisWeek.length,
        sucesso: weekStats.sucesso || 0,
        erro: weekStats.erro || 0,
        processando: weekStats.processando || 0,
        duplicado: weekStats.duplicado || 0
      }
    }
  }, [logs])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'processando':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'duplicado':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'erro':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'processando':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'duplicado':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Estatísticas de Integração</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Estatísticas de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Pedidos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold text-white">
              {stats.today.total}
            </div>
            
            <div className="space-y-2">
              {[
                ['sucesso', 'Sucesso', stats.today.sucesso],
                ['erro', 'Erro', stats.today.erro],
                ['duplicado', 'Duplicado', stats.today.duplicado],
                ['processando', 'Processando', stats.today.processando]
              ].map(([status, label, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(status)}
                  >
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Pedidos dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold text-white">
              {stats.week.total}
            </div>
            
            <div className="space-y-2">
              {[
                ['sucesso', 'Sucesso', stats.week.sucesso],
                ['erro', 'Erro', stats.week.erro],
                ['duplicado', 'Duplicado', stats.week.duplicado],
                ['processando', 'Processando', stats.week.processando]
              ].map(([status, label, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(status)}
                  >
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
