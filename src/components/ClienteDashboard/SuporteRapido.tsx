
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Headphones, Clock, MessageCircle } from 'lucide-react'

interface SuporteRapidoProps {
  onBack: () => void
}

export function SuporteRapido({ onBack }: SuporteRapidoProps) {
  const handleOpenSAC = () => {
    window.open('https://trafegoporcents.com/sac', '_blank')
  }

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Olá! Preciso de suporte através do sistema. Aguardo orientação sobre como proceder.`)
    const whatsappUrl = `https://wa.me/5548911319877?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headphones className="h-6 w-6" />
            Suporte Rápido
          </h1>
          <p className="text-gray-400">Central de atendimento ao cliente</p>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="bg-gray-900 border-gray-800 max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-white text-xl">
            Nova Modalidade de Atendimento
          </CardTitle>
          <CardDescription className="text-gray-400">
            Mudanças importantes no nosso suporte
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Explicação da Mudança */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Importante: Mudança no Atendimento
            </h3>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                Optamos por <strong>não atender mais pelo chat via sistema</strong>. Agora o atendimento 
                voltou a ser pelos <strong>grupos do WhatsApp</strong>.
              </p>
              <p>
                Tanto os gestores preferiram isso quanto os clientes também, pois demonstraram 
                dificuldade em falar pelo chat no sistema.
              </p>
              <p>
                Agora o atendimento é pelo <strong>grupo do WhatsApp</strong>. Se você estiver sem grupo 
                ou sem atendimento no WhatsApp, clique no botão abaixo.
              </p>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3">Como Solicitar Suporte</h3>
            <div className="text-gray-300 space-y-2">
              <p>• Clique no botão abaixo para acessar nosso SAC</p>
              <p>• Explique detalhadamente o que você precisa</p>
              <p>• Respondemos em até <strong className="text-blue-400">4 horas ÚTEIS</strong></p>
              <p>• Você será contatado pelo WhatsApp ou email</p>
            </div>
          </div>

          {/* Botões de Contato */}
          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg shadow-lg"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">WhatsApp Direto</div>
                <div className="text-sm opacity-90">(48) 9 9113-1987</div>
              </div>
            </Button>

            <Button
              onClick={handleOpenSAC}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg shadow-lg"
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Abrir Central SAC
            </Button>
          </div>

          <p className="text-gray-400 text-sm text-center">
            SAC será aberto em uma nova aba
          </p>

          {/* Informações Adicionais */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm text-center">
              <strong>Horário de Atendimento:</strong> Segunda a Sexta, das 8h às 18h<br/>
              <strong>Tempo de Resposta:</strong> Até 4 horas úteis<br/>
              <strong>Canais:</strong> WhatsApp e Email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
