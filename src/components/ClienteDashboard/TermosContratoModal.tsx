import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, FileText, AlertTriangle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'

interface TermosContratoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTermosAceitos: () => void
  onTermosRejeitados?: () => void
}

export function TermosContratoModal({ open, onOpenChange, onTermosAceitos, onTermosRejeitados }: TermosContratoModalProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const { termosAceitos } = useTermosAceitos()
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
      console.log('🔄 [TermosContratoModal] Salvando aceitação dos termos para:', user.email)
      
      const { error } = await supabase
        .from('cliente_profiles')
        .upsert({
          email_cliente: user.email,
          termos_aceitos: true,
          termos_rejeitados: false,
          data_aceite_termos: new Date().toISOString(),
          data_rejeicao_termos: null
        })

      if (error) {
        console.error('❌ [TermosContratoModal] Erro ao salvar aceitação:', error)
        throw error
      }

      console.log('✅ [TermosContratoModal] Termos aceitos com sucesso!')
      
      toast({
        title: "Termos Aceitos",
        description: "Você aceitou os termos e condições. Bem-vindo!",
        duration: 3000
      })

      onTermosAceitos()
      onOpenChange(false)
    } catch (error: any) {
      console.error('❌ [TermosContratoModal] Erro crítico:', error)
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
    
    if (!user?.email || rejeitando) return
    
    setRejeitando(true)
    
    try {
      console.log('🔄 [TermosContratoModal] Salvando rejeição dos termos para:', user.email)
      
      const { error } = await supabase
        .from('cliente_profiles')
        .upsert({
          email_cliente: user.email,
          termos_aceitos: false,
          termos_rejeitados: true,
          data_aceite_termos: null,
          data_rejeicao_termos: new Date().toISOString()
        })

      if (error) {
        console.error('❌ [TermosContratoModal] Erro ao salvar rejeição:', error)
        throw error
      }

      console.log('❌ [TermosContratoModal] Termos rejeitados com sucesso!')
      
      toast({
        title: "Termos Rejeitados",
        description: "Você será direcionado para falar com o suporte sobre o encerramento da parceria.",
        variant: "destructive",
        duration: 3000
      })

      if (onTermosRejeitados) {
        onTermosRejeitados()
      }
      onOpenChange(false)
    } catch (error: any) {
      console.error('❌ [TermosContratoModal] Erro crítico:', error)
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
            : 'max-w-4xl w-full max-h-[85vh]'
          }
        `}
        style={isMobile ? { 
          position: 'fixed !important',
          inset: '0 !important',
          transform: 'none !important', 
          left: '0 !important', 
          top: '0 !important',
          translate: 'none !important',
          width: '100vw !important',
          height: '100vh !important',
          maxWidth: 'none !important',
          maxHeight: 'none !important',
          margin: '0 !important',
          borderRadius: '0 !important'
        } : undefined}
      >
        {/* Header fixo */}
        <DialogHeader className="flex-shrink-0 p-4 pb-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
              Termos de Uso e Condições Gerais
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
        
        {/* Conteúdo com scroll - altura fixa definida */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className={`h-full ${isMobile ? 'px-1' : ''}`}>
            <div className="p-4 space-y-6 text-gray-300">
              
              {/* Aviso Importante */}
              <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-teal-300 mb-2">Modelo de Parceria</h3>
                    <p className="text-sm">
                      Ao aceitar estes termos, você concorda com o modelo de parceria da Tráfego Porcents, 
                      baseado em prestação de serviços de marketing digital com foco em performance, 
                      utilizando comissão sobre os resultados gerados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção 1 - Objeto dos Serviços */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">1. OBJETO DOS SERVIÇOS</h3>
                <p className="leading-relaxed">
                  A <strong className="text-teal-400">Tráfego Porcents</strong> prestará serviços de marketing digital 
                  e tráfego pago com o objetivo de gerar vendas para o seu produto ou serviço. A remuneração ocorre 
                  por meio de comissão sobre os resultados, de forma transparente e justa para ambas as partes.
                </p>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 2 - Taxa de Ativação */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">2. TAXA DE ATIVAÇÃO E ESTRUTURA INICIAL</h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Você já realizou o pagamento da taxa única de <strong className="text-green-400">R$ 350,00</strong>, 
                    que não será cobrada novamente. Essa taxa cobre a criação completa da estrutura inicial, incluindo:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Análise estratégica do seu produto ou serviço</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Criação de criativos com copy profissional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Configuração de BM (Business Manager) e traqueamento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Construção de página de vendas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <span>Integração com WhatsApp e CRM</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-400">
                    <strong>Prazo de entrega:</strong> até 15 dias úteis após a confirmação do pagamento.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 3 - Modelo por Porcentagem */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">3. MODELO POR PORCENTAGEM</h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Nosso modelo é baseado em <strong className="text-teal-400">performance</strong>: você só paga 
                    comissão quando houver vendas reais geradas pelas campanhas que nós criamos e gerenciamos.
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-green-400">Comissão:</strong> 5% sobre o lucro líquido das vendas feitas pelas campanhas.
                  </p>
                  <p className="leading-relaxed">
                    Durante os primeiros <strong className="text-yellow-400">30 dias</strong>, dedicamos nossa equipe 
                    para gerar os melhores resultados possíveis, testando e otimizando continuamente.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 4 - Continuidade da Parceria */}
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-300 mb-3">4. CONTINUIDADE DA PARCERIA</h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Para que a parceria continue após os <strong className="text-white">30 dias iniciais</strong>, 
                    é necessário que exista <strong className="text-green-400">comissionamento mensal mínimo</strong>, 
                    ou seja, algum nível de retorno financeiro para justificar a continuidade do trabalho.
                  </p>
                  <p className="leading-relaxed">
                    Se não houver comissionamento nesse período, a parceria poderá ser encerrada automaticamente, 
                    sem obrigação futura de continuidade.
                  </p>
                  <p className="leading-relaxed">
                    Caso deseje continuar mesmo sem comissionamento nesse prazo, podemos conversar e negociar 
                    o valor mínimo necessário para manter a operação viável para ambos. Essa decisão será avaliada 
                    de forma justa, com base no desempenho e nos esforços realizados.
                  </p>
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-3">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Isso não se trata de uma mensalidade fixa, e sim de uma condição básica para 
                      manter a parceria ativa com envolvimento contínuo da nossa equipe.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 5 - Responsabilidades */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">5. RESPONSABILIDADES</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-teal-400 mb-2">Responsabilidades do Cliente:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Fornecer informações corretas e atualizadas sobre o produto/serviço</li>
                      <li>• Declarar com transparência as vendas realizadas</li>
                      <li>• Cumprir com o pagamento das comissões geradas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-teal-400 mb-2">Responsabilidades da Tráfego Porcents:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Criar e gerenciar todas as campanhas de tráfego</li>
                      <li>• Fornecer suporte e orientações estratégicas</li>
                      <li>• Entregar toda a estrutura inicial conforme combinado</li>
                      <li>• Manter comunicação clara, objetiva e profissional</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Seção 6 - Política de Reembolso */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">6. POLÍTICA DE REEMBOLSO</h3>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    Após a entrega do serviço, <strong className="text-red-400">não há reembolso</strong>, 
                    considerando o envolvimento de equipe, ferramentas e tempo dedicado.
                  </p>
                  <p className="leading-relaxed">
                    No entanto, se nenhum serviço for entregue no prazo de até <strong className="text-yellow-400">15 dias úteis</strong> após o pagamento, 
                    o cliente poderá solicitar reembolso total.
                  </p>
                  <p className="leading-relaxed text-green-400">
                    Caso você não concorde com os termos apresentados, poderá clicar em "Não Aceito" 
                    e solicitar reembolso total do valor pago.
                  </p>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">📞 Contato</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Empresa:</strong> Tráfego Porcents Marketing Digital LTDA</p>
                  <p><strong>CNPJ:</strong> 60.697.779/0001-78</p>
                  <p><strong>E-mail:</strong> contrato@trafegoporcents.com</p>
                  <p><strong>Telefone/WhatsApp:</strong> (11) 9 4306-4852</p>
                  <p><strong>Site:</strong> trafegoporcents.com</p>
                </div>
              </div>
              
              {/* Espaçamento extra para mobile */}
              {isMobile && <div className="h-24" />}
            </div>
          </ScrollArea>
        </div>

        {/* Botões de Ação - Fixos na parte inferior */}
        <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-700 bg-gray-900">
          {/* Se já aceitou os termos, mostrar apenas botão de fechar */}
          {termosAceitos ? (
            <Button
              onClick={handleCloseModal}
              size="lg"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold min-h-[48px]"
            >
              Fechar
            </Button>
          ) : (
            /* Se não aceitou ainda, mostrar botões de aceitar/rejeitar */
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRejeitarTermos}
                variant="outline"
                size="lg"
                className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 min-h-[48px]"
                disabled={aceitando || rejeitando}
              >
                {rejeitando ? 'Rejeitando...' : 'Não Aceito'}
              </Button>
              <Button
                onClick={handleAceitarTermos}
                size="lg"
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold min-h-[48px]"
                disabled={aceitando || rejeitando}
              >
                {aceitando ? 'Aceitando...' : 'Aceito os Termos e Condições'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
