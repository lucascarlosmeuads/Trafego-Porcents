
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Calendar, User, MessageSquare, X, Copy, Expand, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useSacData } from '@/hooks/useSacData'
import { useAuth } from '@/hooks/useAuth'
import { GestorSelector } from './GestorSelector'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface SacDetailsModalProps {
  solicitacao: SacSolicitacao
  onClose: () => void
  onSolicitacaoUpdated?: (updatedSolicitacao: SacSolicitacao) => void
}

export function SacDetailsModal({ solicitacao, onClose, onSolicitacaoUpdated }: SacDetailsModalProps) {
  const { toast } = useToast()
  const { updateGestor, marcarComoConcluido } = useSacData()
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentSolicitacao, setCurrentSolicitacao] = useState(solicitacao)
  const [isMarking, setIsMarking] = useState(false)

  // Sincronizar com mudanças na prop solicitacao
  useEffect(() => {
    console.log('🔄 [SacDetailsModal] Props solicitacao mudou:', {
      id: solicitacao.id,
      email_gestor: solicitacao.email_gestor,
      nome_gestor: solicitacao.nome_gestor,
      status: solicitacao.status
    })
    setCurrentSolicitacao(solicitacao)
  }, [solicitacao])

  const getTipoProblemaColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase()
    if (tipoLower.includes('urgente') || tipoLower.includes('crítico')) {
      return 'destructive'
    }
    if (tipoLower.includes('importante') || tipoLower.includes('alta')) {
      return 'secondary'
    }
    return 'outline'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'default'
      case 'em_andamento':
        return 'secondary'
      case 'aberto':
      default:
        return 'destructive'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />
      case 'em_andamento':
        return <Clock className="h-4 w-4" />
      case 'aberto':
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído'
      case 'em_andamento':
        return 'Em Andamento'
      case 'aberto':
      default:
        return 'Aberto'
    }
  }

  const getPriorityColors = (tipo: string) => {
    const tipoLower = tipo.toLowerCase()
    if (tipoLower.includes('urgente') || tipoLower.includes('crítico')) {
      return {
        border: 'border-red-300',
        bg: 'bg-red-50',
        text: 'text-red-800',
        accent: 'border-l-red-500'
      }
    }
    if (tipoLower.includes('importante') || tipoLower.includes('alta')) {
      return {
        border: 'border-orange-300',
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        accent: 'border-l-orange-500'
      }
    }
    return {
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      accent: 'border-l-blue-500'
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const openWhatsApp = () => {
    const phone = currentSolicitacao.whatsapp.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${currentSolicitacao.nome}, vi sua solicitação de suporte e estou aqui para ajudar!`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`Resposta à sua solicitação - ${currentSolicitacao.tipo_problema}`)
    const body = encodeURIComponent(
      `Olá ${currentSolicitacao.nome},\n\nRecebemos sua solicitação de suporte e estamos trabalhando para resolvê-la.\n\nDescrição do problema: ${currentSolicitacao.descricao}\n\nAtenciosamente,\nEquipe de Suporte`
    )
    window.location.href = `mailto:${currentSolicitacao.email}?subject=${subject}&body=${body}`
  }

  const copyDescription = async () => {
    try {
      await navigator.clipboard.writeText(currentSolicitacao.descricao)
      toast({
        title: "Texto copiado!",
        description: "A descrição foi copiada para a área de transferência.",
      })
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive"
      })
    }
  }

  const handleMarcarComoConcluido = async () => {
    if (!user?.email || !currentSolicitacao.nome_gestor) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o gestor responsável.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsMarking(true)
      console.log('✅ [SacDetailsModal] Marcando SAC como concluído...')
      
      const result = await marcarComoConcluido(
        currentSolicitacao.id,
        user.email,
        currentSolicitacao.nome_gestor
      )

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "SAC marcado como concluído com sucesso.",
        })

        // Atualizar estado local
        const updatedSolicitacao = {
          ...currentSolicitacao,
          status: 'concluido' as const,
          concluido_em: result.data.concluido_em,
          concluido_por: result.data.concluido_por
        }
        
        setCurrentSolicitacao(updatedSolicitacao)
        
        // Notificar componente pai
        if (onSolicitacaoUpdated) {
          onSolicitacaoUpdated(updatedSolicitacao)
        }
      }
    } catch (error) {
      console.error('❌ [SacDetailsModal] Erro ao marcar como concluído:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido ao marcar como concluído",
        variant: "destructive"
      })
    } finally {
      setIsMarking(false)
    }
  }

  const handleUpdateGestor = async (solicitacaoId: string, emailGestor: string, nomeGestor: string) => {
    console.log('🔄 [SacDetailsModal] === CHAMADA PARA ATUALIZAR GESTOR ===')
    console.log('🔄 [SacDetailsModal] Dados recebidos:', {
      solicitacaoId,
      emailGestor,
      nomeGestor
    })
    
    try {
      console.log('🔄 [SacDetailsModal] Chamando updateGestor do hook...')
      const result = await updateGestor(solicitacaoId, emailGestor, nomeGestor)
      console.log('✅ [SacDetailsModal] Atualização concluída com sucesso:', result)
      return result
    } catch (error) {
      console.error('❌ [SacDetailsModal] Erro ao atualizar gestor:', error)
      throw error
    }
  }

  const handleGestorUpdated = (updatedSolicitacao: SacSolicitacao) => {
    console.log('🔄 [SacDetailsModal] === GESTOR ATUALIZADO ===')
    console.log('🔄 [SacDetailsModal] Dados atualizados:', {
      anterior: {
        email_gestor: currentSolicitacao.email_gestor,
        nome_gestor: currentSolicitacao.nome_gestor
      },
      novo: {
        email_gestor: updatedSolicitacao.email_gestor,
        nome_gestor: updatedSolicitacao.nome_gestor
      }
    })
    
    // Atualizar estado local do modal
    setCurrentSolicitacao(updatedSolicitacao)
    
    // Notificar componente pai se callback fornecido
    if (onSolicitacaoUpdated) {
      console.log('🔄 [SacDetailsModal] Notificando componente pai sobre atualização')
      onSolicitacaoUpdated(updatedSolicitacao)
    }
  }

  const priorityColors = getPriorityColors(currentSolicitacao.tipo_problema)
  const isLongDescription = currentSolicitacao.descricao.length > 300
  const podeMarcarComoConcluido = currentSolicitacao.status !== 'concluido' && currentSolicitacao.email_gestor === user?.email

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border-gray-200 force-light-theme">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              Detalhes da Solicitação SAC
              <Badge variant={getStatusColor(currentSolicitacao.status)} className="text-sm">
                {getStatusIcon(currentSolicitacao.status)}
                <span className="ml-1">{getStatusLabel(currentSolicitacao.status)}</span>
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status de conclusão se concluído */}
          {currentSolicitacao.status === 'concluido' && currentSolicitacao.concluido_em && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">SAC Concluído</h3>
                    <p className="text-sm text-green-700">
                      Marcado como concluído em {formatDate(currentSolicitacao.concluido_em)} por {currentSolicitacao.concluido_por}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Descrição do Problema - DESTAQUE PRINCIPAL */}
          <Card className={`bg-white border-2 ${priorityColors.border} border-l-4 ${priorityColors.accent} shadow-lg`}>
            <CardHeader className="pb-3 bg-white">
              <CardTitle className={`flex items-center gap-3 text-lg ${priorityColors.text}`}>
                <MessageSquare className="h-6 w-6" />
                Descrição do Problema
                <Badge variant={getTipoProblemaColor(currentSolicitacao.tipo_problema)} className="ml-auto">
                  {currentSolicitacao.tipo_problema}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className={`
                relative p-6 bg-white rounded-lg border-2 ${priorityColors.border} 
                shadow-inner min-h-[120px]
              `}>
                <div className={`
                  text-gray-900 font-medium leading-7 text-base
                  ${isLongDescription && !isExpanded ? 'line-clamp-6' : ''}
                `}>
                  <p className="whitespace-pre-wrap break-words text-gray-900">
                    {currentSolicitacao.descricao}
                  </p>
                </div>
                
                {/* Botões de ação */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyDescription}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Texto
                  </Button>
                  
                  {isLongDescription && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 bg-white border-gray-300 hover:bg-gray-50"
                    >
                      <Expand className="h-4 w-4" />
                      {isExpanded ? 'Recolher' : 'Ver Completo'}
                    </Button>
                  )}
                  
                  {podeMarcarComoConcluido && (
                    <Button
                      size="sm"
                      onClick={handleMarcarComoConcluido}
                      disabled={isMarking}
                      className="bg-green-600 hover:bg-green-700 text-white ml-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isMarking ? 'Marcando...' : 'Marcar como Concluído'}
                    </Button>
                  )}
                  
                  <div className="ml-auto text-xs text-gray-500">
                    {currentSolicitacao.descricao.length} caracteres
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cliente e Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Cliente */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-lg font-semibold text-gray-900">{currentSolicitacao.nome}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800">{currentSolicitacao.email}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={sendEmail}
                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Enviar Email
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">WhatsApp</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800">{currentSolicitacao.whatsapp}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={openWhatsApp} 
                      className="text-green-600 border-green-600 hover:bg-green-50 bg-white"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Abrir WhatsApp
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-200" />

                <div>
                  <label className="text-sm font-medium text-gray-600">Data da Solicitação</label>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(currentSolicitacao.data_envio)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestor Responsável com Seletor Melhorado */}
            <GestorSelector 
              solicitacao={currentSolicitacao}
              onUpdateGestor={handleUpdateGestor}
              onGestorUpdated={handleGestorUpdated}
            />
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <Button 
            onClick={openWhatsApp} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Phone className="h-4 w-4 mr-2" />
            Contatar via WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            onClick={sendEmail}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>

          <Button 
            variant="outline" 
            onClick={copyDescription}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Descrição
          </Button>

          {podeMarcarComoConcluido && (
            <Button
              onClick={handleMarcarComoConcluido}
              disabled={isMarking}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isMarking ? 'Marcando...' : 'Marcar como Concluído'}
            </Button>
          )}

          <Button 
            variant="secondary" 
            onClick={onClose} 
            className="ml-auto bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
