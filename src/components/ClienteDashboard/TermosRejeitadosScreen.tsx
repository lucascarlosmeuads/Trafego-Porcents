
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, MessageCircle, Mail, Phone, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function TermosRejeitadosScreen() {
  const { signOut } = useAuth()

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Olá! Rejeitei os termos e condições na plataforma Tráfego Porcents e gostaria de conversar sobre o encerramento da parceria. Preciso de orientação sobre os próximos passos.`)
    const whatsappUrl = `https://wa.me/5511943064852?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailContact = () => {
    const subject = encodeURIComponent('Solicitação de Encerramento de Parceria - Termos Rejeitados')
    const body = encodeURIComponent(`Olá,

Rejeitei os termos e condições na plataforma e gostaria de conversar sobre o encerramento da parceria.

Aguardo orientação sobre os próximos passos.

Atenciosamente.`)
    
    window.location.href = `mailto:contrato@trafegoporcents.com?subject=${subject}&body=${body}`
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="max-w-2xl w-full bg-gray-900 border-gray-700">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-red-900/20 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Termos e Condições Rejeitados
            </h1>
            <p className="text-gray-400 leading-relaxed">
              Você optou por não aceitar nossos termos e condições. Entendemos sua decisão e 
              respeitamos sua escolha.
            </p>
          </div>

          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-orange-300 mb-2">
              Próximos Passos
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Para prosseguir com o encerramento da parceria ou esclarecer dúvidas, 
              entre em contato conosco através dos canais abaixo. Nossa equipe está 
              pronta para atendê-lo e orientar sobre todo o processo.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Entre em Contato
            </h3>
            
            <div className="grid gap-3">
              <Button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">WhatsApp (Recomendado)</div>
                  <div className="text-sm opacity-90">(11) 9 4306-4852</div>
                </div>
              </Button>

              <Button
                onClick={handleEmailContact}
                variant="outline"
                className="w-full border-teal-500 text-teal-400 hover:bg-teal-500/10 h-14"
                size="lg"
              >
                <Mail className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">E-mail</div>
                  <div className="text-sm opacity-90">contrato@trafegoporcents.com</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="h-4 w-4 text-teal-400" />
              <h4 className="font-semibold text-white text-sm">Informações de Contato</h4>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Empresa:</strong> Tráfego Porcents Marketing Digital LTDA</p>
              <p><strong>CNPJ:</strong> 60.697.779/0001-78</p>
              <p><strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h</p>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              💡 <strong>Lembre-se:</strong> Você pode solicitar reembolso total do valor pago, 
              conforme estabelecido em nossos termos de uso.
            </p>
          </div>

          {/* Botão de Sair do Sistema */}
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair do Sistema
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Clique aqui para fazer logout e entrar com outra conta
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
