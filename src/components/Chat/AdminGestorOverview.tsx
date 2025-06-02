
import { useChatMessages } from '@/hooks/useChatMessages'
import { MessageItem } from './MessageItem'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AdminGestorOverviewProps {
  emailGestor: string
  nomeGestor: string
}

export function AdminGestorOverview({ emailGestor, nomeGestor }: AdminGestorOverviewProps) {
  const { mensagens, loading } = useChatMessages(undefined, emailGestor)

  console.log('🔍 [AdminGestorOverview] Renderizando overview para:', {
    emailGestor,
    nomeGestor,
    totalMensagens: mensagens.length
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando histórico completo...</p>
        </div>
      </div>
    )
  }

  // Agrupar mensagens por cliente
  const mensagensPorCliente = mensagens.reduce((acc, mensagem) => {
    const cliente = mensagem.email_cliente
    if (!acc[cliente]) {
      acc[cliente] = []
    }
    acc[cliente].push(mensagem)
    return acc
  }, {} as Record<string, typeof mensagens>)

  const clientesComMensagens = Object.keys(mensagensPorCliente)
  const totalMensagens = mensagens.length
  const totalClientes = clientesComMensagens.length

  console.log('📊 [AdminGestorOverview] Estatísticas:', {
    totalMensagens,
    totalClientes,
    clientesComMensagens
  })

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header com informações do gestor */}
      <div className="border-b bg-card p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Histórico Completo - {nomeGestor}</h2>
            <p className="text-sm text-muted-foreground">{emailGestor}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {totalMensagens} mensagem{totalMensagens !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {totalClientes} cliente{totalClientes !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Área de mensagens scrollável */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {totalMensagens === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">💬</div>
            <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
            <p className="text-sm text-muted-foreground">
              Este gestor ainda não teve conversas registradas no sistema
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {clientesComMensagens.map((emailCliente) => {
              const mensagensCliente = mensagensPorCliente[emailCliente]
              const ultimaMensagem = mensagensCliente[mensagensCliente.length - 1]
              
              return (
                <Card key={emailCliente} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{emailCliente}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mensagensCliente.length} mensagem{mensagensCliente.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Última atividade: {format(new Date(ultimaMensagem.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mensagensCliente.map((mensagem) => (
                      <MessageItem
                        key={mensagem.id}
                        mensagem={mensagem}
                        isOwn={mensagem.remetente === 'gestor'}
                        showTimestamp={true}
                      />
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
