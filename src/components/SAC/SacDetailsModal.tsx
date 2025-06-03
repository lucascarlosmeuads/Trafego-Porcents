
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Calendar, User, MessageSquare, X, Copy, Expand } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useSacData } from '@/hooks/useSacData'
import { GestorSelector } from './GestorSelector'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface SacDetailsModalProps {
  solicitacao: SacSolicitacao
  onClose: () => void
}

export function SacDetailsModal({ solicitacao, onClose }: SacDetailsModalProps) {
  const { toast } = useToast()
  const { updateGestor } = useSacData()
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentSolicitacao, setCurrentSolicitacao] = useState(solicitacao)

  // Sincronizar com mudanças na prop solicitacao
  useEffect(() => {
    console.log('🔄 [SacDetailsModal] Props solicitacao mudou:', solicitacao)
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

  const handleUpdateGestor = async (solicitacaoId: string, emailGestor: string, nomeGestor: string) => {
    console.log('🔄 [SacDetailsModal] === DEBUG UPDATE GESTOR ===')
    console.log('🔄 [SacDetailsModal] solicitacaoId recebido:', solicitacaoId)
    console.log('🔄 [SacDetailsModal] currentSolicitacao.id:', currentSolicitacao.id)
    console.log('🔄 [SacDetailsModal] solicitacao original.id:', solicitacao.id)
    console.log('🔄 [SacDetailsModal] emailGestor:', emailGestor)
    console.log('🔄 [SacDetailsModal] nomeGestor:', nomeGestor)
    
    try {
      const result = await updateGestor(solicitacaoId, emailGestor, nomeGestor)
      console.log('✅ [SacDetailsModal] Atualização concluída:', result)
      return result
    } catch (error) {
      console.error('❌ [SacDetailsModal] Erro ao atualizar gestor:', error)
      throw error
    }
  }

  const handleGestorUpdated = (updatedSolicitacao: SacSolicitacao) => {
    console.log('🔄 [SacDetailsModal] Atualizando estado local do modal:', updatedSolicitacao)
    setCurrentSolicitacao(updatedSolicitacao)
  }

  const priorityColors = getPriorityColors(currentSolicitacao.tipo_problema)
  const isLongDescription = currentSolicitacao.descricao.length > 300

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border-gray-200 force-light-theme">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Detalhes da Solicitação SAC
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
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
