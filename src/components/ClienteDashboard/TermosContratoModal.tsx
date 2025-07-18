
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, FileText, AlertTriangle, X, DollarSign, Zap, Shield, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'

interface TermosContratoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTermosAceitos: () => void
  onTermosRejeitados?: () => void
  showOnlyAccept?: boolean
}

export function TermosContratoModal({ 
  open, 
  onOpenChange, 
  onTermosAceitos, 
  onTermosRejeitados,
  showOnlyAccept = false
}: TermosContratoModalProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const { termosAceitos, marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()
  const [aceitando, setAceitando] = useState(false)
  const [rejeitando, setRejeitando] = useState(false)

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [open])

  const handleAceitarTermos = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user?.email || aceitando) return

    setAceitando(true)
    
    try {
      console.log('🔄 [TermosContratoModal] Aceitando termos para:', user.email)
      
      // Usar o hook para marcar termos aceitos
      await marcarTermosAceitos()
      
      console.log('✅ [TermosContratoModal] Termos aceitos com sucesso!')
      
      toast({
        title: "Termos Aceitos",
        description: "Você aceitou os termos e condições. Bem-vindo!",
        duration: 3000
      })

      // Chamar callback do parent
      onTermosAceitos()
      
    } catch (error: any) {
      console.error('❌ [TermosContratoModal] Erro ao aceitar termos:', error)
      toast({
        title: "Erro",
        description: "Erro ao aceitar os termos. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setAceitando(false)
    }
  }

  const handleRejeitarTermos = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user?.email || rejeitando || !onTermosRejeitados) return
    
    setRejeitando(true)
    
    try {
      console.log('🔄 [TermosContratoModal] Rejeitando termos para:', user.email)
      
      // Usar o hook para marcar termos rejeitados
      await marcarTermosRejeitados()
      
      console.log('❌ [TermosContratoModal] Termos rejeitados com sucesso!')
      
      toast({
        title: "Termos Rejeitados",
        description: "Entre em contato conosco para solicitar reembolso (se elegível).",
        variant: "destructive",
        duration: 5000
      })

      // Chamar callback do parent
      onTermosRejeitados()
      
    } catch (error: any) {
      console.error('❌ [TermosContratoModal] Erro ao rejeitar termos:', error)
      toast({
        title: "Erro",
        description: "Erro ao processar sua decisão. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setRejeitando(false)
    }
  }

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          bg-gray-900 border-gray-700 p-0 flex flex-col z-[9999]
          ${isMobile 
            ? '!fixed !inset-0 !w-screen !h-screen !max-w-none !max-h-none !m-0 !rounded-none !transform-none !translate-x-0 !translate-y-0 !left-0 !top-0' 
            : 'max-w-4xl w-full max-h-[90vh]'
          }
        `}
      >
        {/* Header fixo */}
        <DialogHeader className="flex-shrink-0 p-4 pb-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
              Termos de Uso - Painel do Cliente
            </DialogTitle>
            {isMobile && (
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-md hover:bg-gray-800 transition-colors"
                disabled={aceitando || rejeitando}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            {termosAceitos ? "Você já aceitou estes termos anteriormente." : "Leia com atenção antes de decidir."}
          </p>
        </DialogHeader>
        
        {/* Conteúdo com scroll completo */}
        <div className="flex-1 min-h-0">
          <ScrollArea className={`${isMobile ? 'h-[calc(100vh-120px)]' : 'h-[calc(90vh-120px)]'} w-full`}>
            <div className="p-4 space-y-6 text-gray-300">
              
              {/* Modelo de Parceria */}
              <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-teal-300 mb-2">Modelo de Parceria</h3>
                    <p className="text-sm">
                      Ao aceitar estes termos, você concorda com o modelo de parceria da Tráfego Porcents, 
                      baseado em prestação de serviços de marketing digital com foco em performance. 
                      A remuneração ocorre através de comissão sobre os resultados gerados pelas campanhas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção 1 - Objeto dos Serviços */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  1. OBJETO DOS SERVIÇOS
                </h3>
                <p className="leading-relaxed">
                  Prestamos serviços estratégicos de <strong className="text-teal-400">tráfego pago</strong> para 
                  validar e escalar ofertas digitais ou escaláveis, utilizando campanhas criadas por especialistas 
                  com apoio de <strong className="text-purple-400">inteligência artificial</strong>.
                </p>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 2 - Taxa de Ativação */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  2. TAXA DE ATIVAÇÃO – <span className="text-green-400">R$500</span>
                </h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    A ativação da parceria custa <strong className="text-green-400">R$500</strong> (pagamento único) e cobre:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Criativos iniciais em imagem e vídeo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Página de vendas (caso necessário)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Configuração técnica completa (BM, pixel, eventos, domínio etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Estratégia personalizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Preparação e ativação da campanha em até 15 dias úteis</span>
                    </li>
                  </ul>
                  
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-orange-300 text-sm font-medium mb-2">Após a ativação, serviços adicionais são cobrados à parte:</p>
                        <ul className="text-sm space-y-1">
                          <li>• <strong className="text-orange-400">R$30</strong> por imagem extra</li>
                          <li>• <strong className="text-orange-400">R$80</strong> por vídeo extra</li>
                          <li>• <strong className="text-orange-400">R$20</strong> por alteração no site</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 3 - Uso da Plataforma */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  3. USO DA PLATAFORMA – <span className="text-blue-400">R$149,90/mês</span>
                </h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Esse valor é referente ao uso da plataforma Tráfego Porcents, que intermedia sua 
                    operação com os gestores e rastreia os resultados.
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>A cobrança só começa após sua campanha estar ativa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Pode ser cancelado a qualquer momento, sem fidelidade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Não é uma mensalidade de gestão de tráfego</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 4 - Comissão por Performance */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                  4. COMISSÃO POR PERFORMANCE
                </h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Você só paga comissão se houver vendas rastreadas.
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-purple-400">Comissão: 5%</strong> sobre o lucro líquido das vendas rastreadas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Sem comissão mínima obrigatória</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Sem mensalidade de tráfego</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 5 - Política de Reembolso */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  5. POLÍTICA DE REEMBOLSO
                </h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    <strong className="text-green-400">Reembolso integral</strong> só será possível se nenhum serviço 
                    tiver sido iniciado até <strong className="text-yellow-400">15 dias úteis</strong> após o pagamento.
                  </p>
                  <p className="leading-relaxed">
                    Caso qualquer parte do trabalho (análise, criativos, configurações etc.) tenha sido iniciada, 
                    <strong className="text-red-400"> não há reembolso</strong>, pois a equipe já foi mobilizada e remunerada.
                  </p>
                  <p className="leading-relaxed text-sm text-gray-400">
                    Isso está de acordo com o Art. 49 do Código de Defesa do Consumidor (CDC), 
                    por se tratar de serviço personalizado.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 6 - Responsabilidades */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  6. RESPONSABILIDADES
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-teal-400 mb-2">Do Cliente:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Fornecer informações corretas</li>
                      <li>• Declarar com transparência as vendas</li>
                      <li>• Pagar as comissões e eventuais serviços extras</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-teal-400 mb-2">Da Tráfego Porcents:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Entregar a estrutura inicial conforme combinado</li>
                      <li>• Gerenciar campanhas com foco em performance</li>
                      <li>• Fornecer suporte técnico e estratégico</li>
                      <li>• Manter comunicação profissional e objetiva</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">📞 Contato</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Empresa:</strong> Tráfego Porcents Marketing Digital LTDA</p>
                  <p><strong>CNPJ:</strong> 60.697.779/0001-78</p>
                  <p><strong>E-mail:</strong> contrato@trafegoporcents.com</p>
                  <p><strong>WhatsApp:</strong> (11) 94306-4852</p>
                  <p><strong>Site:</strong> www.trafegoporcents.com</p>
                </div>
              </div>

              {/* Botões de Ação - Agora dentro do conteúdo scrollável */}
              <div className={`pt-6 ${isMobile ? 'pb-8' : 'pb-6'}`}>
                {/* Se já aceitou os termos ou modo somente aceitar, mostrar apenas botão de aceitar/fechar */}
                {termosAceitos || showOnlyAccept ? (
                  <div className="flex flex-col gap-3">
                    {showOnlyAccept && !termosAceitos && (
                      <Button
                        onClick={handleAceitarTermos}
                        size="lg"
                        className={`
                          w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all
                          ${isMobile ? 'h-14 text-base px-8' : 'h-12 px-6'}
                        `}
                        disabled={aceitando}
                      >
                        {aceitando ? 'Aceitando...' : 'Li e aceito os termos'}
                      </Button>
                    )}
                    {termosAceitos && (
                      <Button
                        onClick={handleCloseModal}
                        size="lg"
                        className={`
                          w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold
                          ${isMobile ? 'h-14 text-base px-8' : 'h-12 px-6'}
                        `}
                      >
                        Fechar
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Se não aceitou ainda e não é modo somente aceitar, mostrar botões de aceitar/rejeitar */
                  <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                    <Button
                      onClick={handleRejeitarTermos}
                      variant="outline"
                      size="lg"
                      className={`
                        border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400 font-semibold
                        ${isMobile ? 'w-full h-14 text-base px-8 order-2' : 'flex-1 h-12 px-6'}
                      `}
                      disabled={aceitando || rejeitando}
                    >
                      {rejeitando ? 'Rejeitando...' : 'Não aceito e desejo solicitar reembolso (se elegível)'}
                    </Button>
                    <Button
                      onClick={handleAceitarTermos}
                      size="lg"
                      className={`
                        bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg
                        ${isMobile ? 'w-full h-14 text-base px-8 order-1' : 'flex-1 h-12 px-6'}
                      `}
                      disabled={aceitando || rejeitando}
                    >
                      {aceitando ? 'Aceitando...' : 'Li e aceito os termos'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
