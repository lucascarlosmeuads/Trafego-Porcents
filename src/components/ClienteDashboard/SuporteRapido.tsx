
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle, Clock, Settings, Users, Target } from 'lucide-react'

interface SuporteRapidoProps {
  onBack: () => void
}

export function SuporteRapido({ onBack }: SuporteRapidoProps) {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Olá! Preciso de ajuda com a configuração da minha campanha. Gostaria de conversar sobre:

• Configuração do Business Manager
• Criação de criativos
• Setup da campanha
• Outros aspectos técnicos

Aguardo orientação para prosseguir.`)
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
            <MessageCircle className="h-6 w-6" />
            Suporte Técnico
          </h1>
          <p className="text-gray-400">WhatsApp direto para configuração da sua campanha</p>
        </div>
      </div>

      {/* Card Principal */}
      <Card className="bg-gray-900 border-gray-800 max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-white text-xl">
            Suporte para Configuração de Campanha
          </CardTitle>
          <CardDescription className="text-gray-400">
            WhatsApp direto para questões técnicas da sua campanha
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Explicação do Serviço */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              O que podemos ajudar via WhatsApp:
            </h3>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Configuração do Business Manager:</strong> Setup completo da sua conta BM, permissões e acessos</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Criação de Criativos:</strong> Orientação sobre materiais, formatos e melhores práticas</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Setup da Campanha:</strong> Configurações técnicas, públicos e estratégias</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Dúvidas Técnicas:</strong> Resolução de problemas e otimizações</p>
              </div>
            </div>
          </div>

          {/* Como Funciona */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-400" />
              Como Funciona
            </h3>
            <div className="text-gray-300 space-y-2">
              <p>• <strong>Atendimento Direto:</strong> Converse direto com nosso time técnico</p>
              <p>• <strong>Resposta Rápida:</strong> Geralmente respondemos em poucos minutos</p>
              <p>• <strong>Suporte Personalizado:</strong> Ajuda específica para o seu negócio</p>
              <p>• <strong>Acompanhamento:</strong> Te guiamos do início ao fim da configuração</p>
            </div>
          </div>

          {/* Botão Principal */}
          <div className="space-y-3">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg shadow-lg"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Falar no WhatsApp</div>
                <div className="text-sm opacity-90">Suporte técnico direto - (48) 9 9113-1987</div>
              </div>
            </Button>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm text-center">
              <strong>Horário de Atendimento:</strong> Segunda a Sexta, das 8h às 18h<br/>
              <strong>Especialização:</strong> Business Manager, Criativos e Configuração de Campanhas<br/>
              <strong>Tempo de Resposta:</strong> Geralmente em poucos minutos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
