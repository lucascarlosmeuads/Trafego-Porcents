
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle, Clock, Settings, Users, Target, AlertTriangle, Key } from 'lucide-react'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { useAuth } from '@/hooks/useAuth'

interface SuporteRapidoProps {
  onBack: () => void
  onTabChange?: (tab: string) => void
}

export function SuporteRapido({ onBack, onTabChange }: SuporteRapidoProps) {
  const { user } = useAuth()
  const { marcarPasso } = useClienteProgresso(user?.email || '')

  const handleWhatsAppContact = async () => {
    console.log('📞 [SuporteRapido] Cliente clicou no WhatsApp - marcando passo 3')
    
    // Marcar passo 3 (BM Configurado) quando cliente acessa suporte
    await marcarPasso(3)
    
    const message = encodeURIComponent(`Olá! Preciso de ajuda com a configuração da minha campanha. Gostaria de conversar sobre:

• Configuração do Business Manager
• Criação de criativos
• Setup da campanha
• Outros aspectos técnicos

Aguardo orientação para prosseguir.`)
    const whatsappUrl = `https://wa.me/5548911319877?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const handleLiberarBM = async () => {
    console.log('🔑 [SuporteRapido] Cliente clicou em Liberar BM - marcando passo 3')
    
    // Marcar passo 3 (BM Configurado) quando cliente acessa tutorial BM
    await marcarPasso(3)
    
    if (onTabChange) {
      onTabChange('steps')
    }
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

      {/* Aviso de Horário de Atendimento */}
      <Card className="bg-yellow-900/20 border-yellow-700/30 max-w-4xl mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-yellow-100 font-semibold">Horário de Atendimento</h3>
              <p className="text-yellow-200/90 text-sm">
                <strong>Segunda a Sexta-feira:</strong> 08h às 18h<br/>
                <strong>Fins de semana e feriados:</strong> Sem atendimento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-400" />
              Como Funciona
            </h3>
            <div className="text-gray-300 space-y-2">
              <p>• <strong>Atendimento Direto:</strong> Converse direto com nosso time técnico</p>
              <p>• <strong>Resposta Rápida:</strong> Geralmente respondemos em poucos minutos (horário comercial)</p>
              <p>• <strong>Suporte Personalizado:</strong> Ajuda específica para o seu negócio</p>
              <p>• <strong>Acompanhamento:</strong> Te guiamos do início ao fim da configuração</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            {/* Botão WhatsApp */}
            <Button
              onClick={handleWhatsAppContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-6 shadow-lg rounded-lg min-h-[80px]"
              size="lg"
            >
              <div className="flex items-center w-full gap-3 max-w-full">
                <MessageCircle className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 text-left min-w-0 overflow-hidden">
                  <div className="font-semibold text-sm md:text-base leading-tight mb-1">
                    Falar no WhatsApp
                  </div>
                  <div className="text-xs md:text-sm opacity-90 leading-tight break-words hyphens-auto">
                    Suporte técnico direto - (48) 9 9113-1987
                  </div>
                </div>
              </div>
            </Button>

            {/* Botão Libere sua BM */}
            {onTabChange && (
              <Button
                onClick={handleLiberarBM}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-6 shadow-lg rounded-lg min-h-[80px]"
                size="lg"
              >
                <div className="flex items-center w-full gap-3 max-w-full">
                  <Key className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0 overflow-hidden">
                    <div className="font-semibold text-sm md:text-base leading-tight mb-1">
                      Libere sua BM
                    </div>
                    <div className="text-xs md:text-sm opacity-90 leading-tight break-words hyphens-auto">
                      Tutorial para configurar Business Manager
                    </div>
                  </div>
                </div>
              </Button>
            )}
          </div>

          {/* Informações Adicionais Atualizadas */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-100 font-semibold text-sm mb-2">Importante - Horário de Atendimento:</p>
                <div className="text-gray-300 text-sm space-y-1">
                  <p><strong>Segunda a Sexta-feira:</strong> 08h às 18h</p>
                  <p><strong>Fins de semana e feriados:</strong> Sem atendimento</p>
                  <p><strong>Especialização:</strong> Business Manager, Criativos e Configuração de Campanhas</p>
                  <p><strong>Tempo de Resposta:</strong> Poucos minutos durante horário comercial</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mt-3">
              <p className="text-yellow-200 text-xs text-center">
                📅 Mensagens enviadas fora do horário comercial serão respondidas no próximo dia útil
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
