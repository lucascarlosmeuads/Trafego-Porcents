
import React, { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Globe,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  Loader2
} from 'lucide-react'
import { useClientSiteRequest } from '@/hooks/useClientSiteRequest'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'

export function ClienteSiteDescricao() {
  const { status, loading, requestSite, accessForm, getStatusMessage } = useClientSiteRequest()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  const isMobile = useIsMobile()

  const statusInfo = getStatusMessage()

  const handleRequestSite = async () => {
    setProcessing(true)
    try {
      const result = await requestSite()
      
      if (result.success) {
        if (result.existing) {
          toast({
            title: "Site já solicitado",
            description: "Você já possui uma solicitação de site ativa.",
          })
        } else {
          toast({
            title: "Sucesso!",
            description: "Site solicitado com sucesso! Agora acesse o formulário.",
          })
        }
      } else {
        toast({
          title: "Erro",
          description: "Erro ao solicitar site. Tente novamente.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar site:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleAccessForm = async () => {
    setProcessing(true)
    try {
      const formUrl = await accessForm()
      
      if (formUrl) {
        window.open(formUrl, '_blank', 'noopener,noreferrer')
        
        toast({
          title: "Formulário Acessado!",
          description: "O formulário foi aberto em uma nova aba. Complete-o para finalizar seu site.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível acessar o formulário. Entre em contato com o suporte.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Erro ao acessar formulário:', error)
      toast({
        title: "Erro",
        description: "Erro ao acessar formulário. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = () => {
    const iconSize = isMobile ? "h-5 w-5" : "h-6 w-6"
    
    switch (status) {
      case 'never_requested':
        return <Globe className={`${iconSize} text-blue-600`} />
      case 'requested_pending':
        return <Clock className={`${iconSize} text-orange-600`} />
      case 'form_accessed':
        return <CheckCircle className={`${iconSize} text-green-600`} />
      case 'loading':
        return <Loader2 className={`${iconSize} text-gray-400 animate-spin`} />
      default:
        return <Globe className={`${iconSize} text-gray-400`} />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'never_requested':
        return 'border-blue-200 bg-blue-50'
      case 'requested_pending':
        return 'border-orange-200 bg-orange-50'
      case 'form_accessed':
        return 'border-green-200 bg-green-50'
      case 'loading':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getButtonText = () => {
    if (status === 'never_requested') {
      return isMobile ? 'Solicitar Site' : 'Solicitar Meu Site'
    }
    return isMobile ? 'Acessar Form' : 'Acessar Formulário'
  }

  if (loading && status === 'loading') {
    return (
      <div className={`space-y-${isMobile ? '4' : '6'}`}>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className={`p-${isMobile ? '4' : '6'}`}>
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className={`h-${isMobile ? '5' : '6'} w-${isMobile ? '5' : '6'} text-gray-400 animate-spin`} />
              <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                Carregando status do site...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
      {/* Card Principal de Status */}
      <Card className={`${getStatusColor()} border transition-all duration-300`}>
        <CardContent className={`p-${isMobile ? '4' : '6'}`}>
          <div className={`flex items-start space-x-${isMobile ? '3' : '4'}`}>
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            
            <div className={`flex-1 space-y-${isMobile ? '2' : '3'}`}>
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-800`}>
                  {statusInfo.title}
                </h3>
                <p className={`text-gray-600 mt-1 ${isMobile ? 'text-sm' : ''}`}>
                  {statusInfo.description}
                </p>
              </div>

              {statusInfo.action && (
                <Button
                  onClick={status === 'never_requested' ? handleRequestSite : handleAccessForm}
                  disabled={processing}
                  size={isMobile ? "sm" : "default"}
                  className={`
                    ${status === 'never_requested' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                    } 
                    text-white transition-all duration-200 hover:scale-105
                    ${isMobile ? 'text-xs px-3 py-2' : ''}
                  `}
                >
                  {processing ? (
                    <>
                      <Loader2 className={`w-${isMobile ? '3' : '4'} h-${isMobile ? '3' : '4'} mr-2 animate-spin`} />
                      {isMobile ? 'Processando...' : 'Processando...'}
                    </>
                  ) : (
                    <>
                      {status === 'never_requested' ? (
                        <Sparkles className={`w-${isMobile ? '3' : '4'} h-${isMobile ? '3' : '4'} mr-2`} />
                      ) : (
                        <ExternalLink className={`w-${isMobile ? '3' : '4'} h-${isMobile ? '3' : '4'} mr-2`} />
                      )}
                      {getButtonText()}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Informativos */}
      {status === 'requested_pending' && (
        <Alert className="border-orange-200 bg-orange-50">
          <Shield className={`h-4 w-4 text-orange-600`} />
          <AlertDescription className={`text-orange-800 ${isMobile ? 'text-sm' : ''}`}>
            <strong>🔒 Acesso Único:</strong> {isMobile ? 'Formulário só pode ser acessado uma vez.' : 'O formulário pode ser acessado apenas uma vez por questões de segurança. Certifique-se de completá-lo totalmente antes de fechar.'}
          </AlertDescription>
        </Alert>
      )}

      {status === 'form_accessed' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className={`text-green-800 ${isMobile ? 'text-sm' : ''}`}>
            <strong>✅ Próximos Passos:</strong> {isMobile ? 'Andreza analisará suas informações e entrará em contato.' : 'A Andreza analisará suas informações e entrará em contato em breve para dar continuidade à criação do seu site.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Informações Adicionais */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className={`p-${isMobile ? '3' : '4'}`}>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-800 space-y-2`}>
            <p className="font-medium">💡 {isMobile ? 'Informações:' : 'Informações Importantes:'}</p>
            <ul className={`space-y-1 ml-4 list-disc ${isMobile ? 'text-xs' : ''}`}>
              <li>Seu site está incluso no pacote contratado</li>
              <li>{isMobile ? 'Formulário protegido e personalizado' : 'O formulário é protegido e personalizado para você'}</li>
              <li>{isMobile ? 'Equipe entrará em contato após preenchimento' : 'Após o preenchimento, nossa equipe entrará em contato'}</li>
              <li>{isMobile ? 'Prazo: 7-10 dias úteis' : 'O prazo de desenvolvimento é de 7-10 dias úteis'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
