
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MaxIntegrationLog } from '@/hooks/useMaxIntegration'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MaxIntegrationLogsProps {
  logs: MaxIntegrationLog[]
}

export function MaxIntegrationLogs({ logs }: MaxIntegrationLogsProps) {
  const [selectedLog, setSelectedLog] = useState<MaxIntegrationLog | null>(null)

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
        return <Clock className="w-4 h-4 text-gray-500" />
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'Sucesso'
      case 'erro':
        return 'Erro'
      case 'processando':
        return 'Processando'
      case 'duplicado':
        return 'Duplicado'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Logs de Integração
          <Badge variant="outline" className="ml-2">
            {logs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum log de integração encontrado</p>
            <p className="text-sm">Os logs aparecerão aqui quando o App Max enviar pedidos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 20).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(log.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white">
                        {log.dados_originais?.nome_cliente || 'Cliente não identificado'}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(log.status)}
                      >
                        {getStatusLabel(log.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {log.pedido_id && (
                        <span>Pedido: {log.pedido_id}</span>
                      )}
                      
                      {log.gestor_atribuido && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{log.gestor_atribuido}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                    </div>

                    {log.erro_detalhes && (
                      <div className="mt-1 text-xs text-red-400">
                        {log.erro_detalhes}
                      </div>
                    )}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Detalhes do Log</DialogTitle>
                    </DialogHeader>
                    
                    {selectedLog && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-400">
                              Status
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(selectedLog.status)}
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(selectedLog.status)}
                              >
                                {getStatusLabel(selectedLog.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-400">
                              Data/Hora
                            </label>
                            <div className="text-sm text-white mt-1">
                              {new Date(selectedLog.created_at).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        {selectedLog.pedido_id && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">
                              ID do Pedido
                            </label>
                            <div className="text-sm text-white mt-1 font-mono">
                              {selectedLog.pedido_id}
                            </div>
                          </div>
                        )}

                        {selectedLog.gestor_atribuido && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">
                              Gestor Atribuído
                            </label>
                            <div className="text-sm text-white mt-1">
                              {selectedLog.gestor_atribuido}
                            </div>
                          </div>
                        )}

                        {selectedLog.cliente_criado_id && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">
                              ID do Cliente Criado
                            </label>
                            <div className="text-sm text-white mt-1">
                              {selectedLog.cliente_criado_id}
                            </div>
                          </div>
                        )}

                        {selectedLog.erro_detalhes && (
                          <div>
                            <label className="text-sm font-medium text-red-400">
                              Erro
                            </label>
                            <div className="text-sm text-red-300 mt-1 p-2 bg-red-500/10 rounded border border-red-500/20">
                              {selectedLog.erro_detalhes}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-gray-400">
                            Dados Originais do App Max
                          </label>
                          <ScrollArea className="h-64 mt-1">
                            <pre className="text-xs text-gray-300 p-3 bg-gray-800 rounded border border-gray-700 overflow-x-auto">
                              {JSON.stringify(selectedLog.dados_originais, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
            
            {logs.length > 20 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                Mostrando os 20 logs mais recentes de {logs.length} total
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
