
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, Calendar, User, MessageSquare, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface SacDetailsModalProps {
  solicitacao: SacSolicitacao
  onClose: () => void
}

export function SacDetailsModal({ solicitacao, onClose }: SacDetailsModalProps) {
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const openWhatsApp = () => {
    const phone = solicitacao.whatsapp.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${solicitacao.nome}, vi sua solicitação de suporte e estou aqui para ajudar!`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`Resposta à sua solicitação - ${solicitacao.tipo_problema}`)
    const body = encodeURIComponent(
      `Olá ${solicitacao.nome},\n\nRecebemos sua solicitação de suporte e estamos trabalhando para resolvê-la.\n\nDescrição do problema: ${solicitacao.descricao}\n\nAtenciosamente,\nEquipe de Suporte`
    )
    window.location.href = `mailto:${solicitacao.email}?subject=${subject}&body=${body}`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Detalhes da Solicitação</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="text-lg font-semibold">{solicitacao.nome}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm">{solicitacao.email}</p>
                  <Button size="sm" variant="outline" onClick={sendEmail}>
                    <Mail className="h-4 w-4 mr-1" />
                    Enviar Email
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">WhatsApp</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm">{solicitacao.whatsapp}</p>
                  <Button size="sm" variant="outline" onClick={openWhatsApp} className="text-green-600 border-green-600 hover:bg-green-50">
                    <Phone className="h-4 w-4 mr-1" />
                    Abrir WhatsApp
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">Data da Solicitação</label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {formatDate(solicitacao.data_envio)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Problema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Detalhes do Problema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo do Problema</label>
                <div className="mt-1">
                  <Badge variant={getTipoProblemaColor(solicitacao.tipo_problema)} className="text-sm">
                    {solicitacao.tipo_problema}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Descrição Completa</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {solicitacao.descricao}
                  </p>
                </div>
              </div>

              {solicitacao.nome_gestor && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gestor Responsável</label>
                    <p className="text-sm font-semibold">{solicitacao.nome_gestor}</p>
                    {solicitacao.email_gestor && (
                      <p className="text-xs text-gray-500">{solicitacao.email_gestor}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button onClick={openWhatsApp} className="bg-green-600 hover:bg-green-700">
            <Phone className="h-4 w-4 mr-2" />
            Contatar via WhatsApp
          </Button>
          
          <Button variant="outline" onClick={sendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>

          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
