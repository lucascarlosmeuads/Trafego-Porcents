
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useSiteSolicitations } from '@/hooks/useSiteSolicitations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface SiteRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SiteRequestModal({ open, onOpenChange }: SiteRequestModalProps) {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')
  const { solicitations, createSolicitation, loading } = useSiteSolicitations()
  const [requesting, setRequesting] = useState(false)

  // Verificar se já existe uma solicitação para este cliente
  const existingSolicitation = solicitations.find(s => s.email_cliente === user?.email)

  const handleRequestSite = async () => {
    if (!user?.email || !cliente) return

    setRequesting(true)
    
    const success = await createSolicitation({
      email_cliente: user.email,
      nome_cliente: cliente.nome_cliente || 'Cliente',
      telefone: cliente.telefone || '',
      email_gestor: cliente.email_gestor || 'andreza@trafegoporcents.com'
    })

    if (success) {
      // Redirecionar para o formulário externo
      window.open('https://siteexpress.space/formulario', '_blank')
    }

    setRequesting(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'em_andamento':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><AlertCircle className="h-3 w-3 mr-1" />Em andamento</Badge>
      case 'concluido':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 max-w-md">
          <div className="animate-pulse p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-blue-800 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Incluso no Pacote
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-gray-700">
            <p className="text-lg font-semibold mb-2">📢 Seu site já está incluso no pacote! 💻✨</p>
            <p className="text-sm">
              Agora só falta preencher o formulário abaixo para começarmos a criação:
            </p>
            <p className="text-xs text-blue-600 font-mono mt-1">
              🔗 https://siteexpress.space/formulario
            </p>
            <p className="text-sm mt-2 text-gray-600">
              Leva só 3 minutinhos e é super importante pra entendermos como seu site deve ser criado 🚀
            </p>
          </div>

          {existingSolicitation ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status da solicitação:</span>
                {getStatusBadge(existingSolicitation.status)}
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Solicitado em:</p>
                <p className="text-sm font-medium">
                  {new Date(existingSolicitation.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {existingSolicitation.observacoes && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Observações:</p>
                    <p className="text-sm">{existingSolicitation.observacoes}</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => window.open('https://siteexpress.space/formulario', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar Formulário Novamente
              </Button>

              {existingSolicitation.status === 'pendente' && (
                <p className="text-xs text-center text-gray-500">
                  A Andreza entrará em contato em breve para verificar o preenchimento
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleRequestSite}
                disabled={requesting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {requesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Quero criar meu site 🚀
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                Ao clicar, você será redirecionado para o formulário e a Andreza será notificada
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
