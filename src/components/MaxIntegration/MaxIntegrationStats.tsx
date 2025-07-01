
import { MaxIntegrationLog } from '@/hooks/useMaxIntegration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MaxIntegrationStatsProps {
  logs: MaxIntegrationLog[]
}

export function MaxIntegrationStats({ logs }: MaxIntegrationStatsProps) {
  // Calcular estatísticas
  const totalLogs = logs.length
  const sucessos = logs.filter(log => log.status === 'sucesso').length
  const erros = logs.filter(log => log.status === 'erro').length
  const duplicados = logs.filter(log => log.status === 'duplicado').length
  const processando = logs.filter(log => log.status === 'processando').length
  
  const taxaSucesso = totalLogs > 0 ? Math.round((sucessos / totalLogs) * 100) : 0
  const taxaErro = totalLogs > 0 ? Math.round((erros / totalLogs) * 100) : 0
  
  // Últimas 24h
  const agora = new Date()
  const ontemAgora = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
  const logsUltimas24h = logs.filter(log => new Date(log.created_at) > ontemAgora)
  const sucessosUltimas24h = logsUltimas24h.filter(log => log.status === 'sucesso').length
  
  // Último log
  const ultimoLog = logs[0]
  
  // Clientes únicos criados
  const clientesCriados = logs.filter(log => log.cliente_criado_id).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Integrações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Tentativas</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalLogs}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-400">+{logsUltimas24h.length}</span> nas últimas 24h
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Sucesso */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          {taxaSucesso >= 80 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">{taxaSucesso}%</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{sucessos} sucessos</span>
            <span>•</span>
            <span>{erros} erros</span>
          </div>
        </CardContent>
      </Card>

      {/* Clientes Criados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Criados</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">{clientesCriados}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-400">+{sucessosUltimas24h}</span> nas últimas 24h
          </p>
        </CardContent>
      </Card>

      {/* Status da Última Integração */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Integração</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {ultimoLog ? (
            <>
              <div className="flex items-center space-x-2 mb-1">
                {ultimoLog.status === 'sucesso' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {ultimoLog.status === 'erro' && <XCircle className="w-4 h-4 text-red-500" />}
                {ultimoLog.status === 'duplicado' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                {ultimoLog.status === 'processando' && <Clock className="w-4 h-4 text-yellow-500" />}
                
                <Badge 
                  variant="outline" 
                  className={
                    ultimoLog.status === 'sucesso' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    ultimoLog.status === 'erro' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    ultimoLog.status === 'duplicado' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }
                >
                  {ultimoLog.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(ultimoLog.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </>
          ) : (
            <div className="text-sm text-gray-400">
              Nenhuma integração detectada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Status */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Distribuição de Status</CardTitle>
          <CardDescription>
            Análise detalhada dos resultados das integrações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-lg font-bold text-green-400">{sucessos}</div>
              <div className="text-xs text-muted-foreground">Sucessos</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-lg font-bold text-red-400">{erros}</div>
              <div className="text-xs text-muted-foreground">Erros</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-lg font-bold text-orange-400">{duplicados}</div>
              <div className="text-xs text-muted-foreground">Duplicados</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-lg font-bold text-yellow-400">{processando}</div>
              <div className="text-xs text-muted-foreground">Processando</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
