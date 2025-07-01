
import { useWebhookMonitoring } from '@/hooks/useWebhookMonitoring'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  RefreshCw,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export function WebhookMonitoringDashboard() {
  const { attempts, stats, isListening, refetch } = useWebhookMonitoring()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Status de Monitoramento */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Monitor de Webhook em Tempo Real
          </h2>
          <p className="text-gray-400">
            Monitoramento ativo das tentativas de webhook do AppMax
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isListening ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Monitorando
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <XCircle className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tentativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.successfulAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAttempts > 0 ? Math.round((stats.successfulAttempts / stats.totalAttempts) * 100) : 0}% taxa de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.failedAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAttempts > 0 ? Math.round((stats.failedAttempts / stats.totalAttempts) * 100) : 0}% taxa de erro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Tentativa</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-white">
              {stats.lastAttempt ? (
                formatDistanceToNow(new Date(stats.lastAttempt), {
                  addSuffix: true,
                  locale: ptBR
                })
              ) : (
                'Nenhuma'
              )}
            </div>
            <p className="text-xs text-muted-foreground">Tempo decorrido</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tentativas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Tentativas Recentes</CardTitle>
          <CardDescription>
            Últimas 20 tentativas de webhook capturadas em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma tentativa de webhook detectada</p>
              <p className="text-sm">As tentativas aparecerão aqui em tempo real</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {getStatusIcon(attempt.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">
                          {attempt.body?.nome_cliente || attempt.body?.nome || 'Cliente não identificado'}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(attempt.status)}
                        >
                          {attempt.status}
                        </Badge>
                        {attempt.client_created && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Cliente Criado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>
                          {formatDistanceToNow(new Date(attempt.timestamp), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                        {attempt.error_message && (
                          <span className="text-red-400 truncate max-w-xs">
                            {attempt.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes da Tentativa de Webhook</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-400">Status</label>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(attempt.status)}
                              <Badge className={getStatusColor(attempt.status)}>
                                {attempt.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-400">Timestamp</label>
                            <div className="text-sm text-white mt-1">
                              {new Date(attempt.timestamp).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        {attempt.error_message && (
                          <div>
                            <label className="text-sm font-medium text-red-400">Erro</label>
                            <div className="text-sm text-red-300 mt-1 p-2 bg-red-500/10 rounded border border-red-500/20">
                              {attempt.error_message}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-gray-400">Dados Recebidos</label>
                          <ScrollArea className="h-64 mt-1">
                            <pre className="text-xs text-gray-300 p-3 bg-gray-800 rounded border border-gray-700 overflow-x-auto">
                              {JSON.stringify(attempt.body, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
