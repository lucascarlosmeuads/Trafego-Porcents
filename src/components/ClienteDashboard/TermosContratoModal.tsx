
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, FileText, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface TermosContratoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTermosAceitos: () => void
}

export function TermosContratoModal({ open, onOpenChange, onTermosAceitos }: TermosContratoModalProps) {
  const { user } = useAuth()
  const [aceitando, setAceitando] = useState(false)
  const [rejeitando, setRejeitando] = useState(false)

  const handleAceitarTermos = async () => {
    if (!user?.email) return

    setAceitando(true)
    
    try {
      console.log('🔄 [TermosContratoModal] Salvando aceitação dos termos para:', user.email)
      
      const { error } = await supabase
        .from('cliente_profiles')
        .upsert({
          email_cliente: user.email,
          termos_aceitos: true,
          data_aceite_termos: new Date().toISOString()
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

  const handleRejeitarTermos = async () => {
    setRejeitando(true)
    
    toast({
      title: "Termos Rejeitados",
      description: "Para usar o sistema é necessário aceitar os termos e condições.",
      variant: "destructive",
      duration: 5000
    })

    setTimeout(() => {
      setRejeitando(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-teal-400" />
            Termos de Uso e Condições Gerais
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-gray-300">
            
            {/* Aviso Importante */}
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-300 mb-2">Leia Atentamente</h3>
                  <p className="text-sm">
                    Ao aceitar estes termos, você concorda com nosso modelo de prestação de serviços 
                    de marketing digital por porcentagem sobre resultados.
                  </p>
                </div>
              </div>
            </div>

            {/* Seção 1 - Objeto do Contrato */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. OBJETO DOS SERVIÇOS</h3>
              <p className="leading-relaxed">
                A <strong className="text-teal-400">Tráfego Porcents</strong> prestará serviços de marketing digital 
                e tráfego pago com remuneração por comissão sobre as vendas realizadas através dos anúncios 
                criados e gerenciados por nossa equipe.
              </p>
            </div>

            <Separator className="bg-gray-700" />

            {/* Seção 2 - Taxa de Ativação */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. TAXA DE ATIVAÇÃO E ESTRUTURA</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Para início dos trabalhos, há uma taxa única de <strong className="text-green-400">R$ 350,00</strong>, 
                  referente à construção de toda estrutura inicial, incluindo:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Análise completa do produto/serviço</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Criação de criativos de imagens com copywriter bem feitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Configuração da BM e do traqueamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Construção da página de vendas (site)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>Integração com WhatsApp e CRM</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-400">
                  <strong>Prazo de entrega:</strong> até 15 dias corridos após confirmação do pagamento.
                </p>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Seção 3 - Modelo por Porcentagem */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. MODELO POR PORCENTAGEM</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Nosso modelo funciona por <strong className="text-teal-400">comissão sobre resultados</strong>. 
                  Somos remunerados apenas com base nas vendas realizadas através das campanhas.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-green-400">Comissão:</strong> 5% sobre o lucro líquido gerado pelas vendas.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-yellow-400">Período de avaliação:</strong> Durante os primeiros 30 dias, 
                  prestamos todos os serviços com máxima qualidade e dedicação para gerar resultados efetivos.
                </p>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Seção 4 - Nova Regra de Parceria */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-300 mb-3">4. REGRA DE PARCERIA ATIVA</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  Para manter a parceria ativa, é necessário que nos <strong className="text-white">30 primeiros dias</strong> 
                  tenhamos comissionamento mínimo de <strong className="text-green-400">R$ 200</strong>.
                </p>
                <p className="leading-relaxed">
                  Caso isso não aconteça, a parceria pode ser encerrada automaticamente. 
                  <strong className="text-yellow-300"> Isso não é uma mensalidade.</strong>
                </p>
                <p className="leading-relaxed">
                  Se desejar manter o projeto mesmo sem atingir esse valor, poderá realizar o pagamento manual de R$ 200.
                </p>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Seção 5 - Responsabilidades */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. RESPONSABILIDADES</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-teal-400 mb-2">Suas Responsabilidades:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Fornecer informações verdadeiras sobre o produto</li>
                    <li>• Declarar corretamente as vendas realizadas</li>
                    <li>• Pagar a taxa inicial de R$ 350,00</li>
                    <li>• Cumprir com pagamentos das comissões</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-teal-400 mb-2">Nossas Responsabilidades:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Criar e gerenciar os anúncios</li>
                    <li>• Fornecer suporte e atualizações estratégicas</li>
                    <li>• Entregar estrutura completa no prazo</li>
                    <li>• Manter comunicação clara e respeitosa</li>
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
                  <strong className="text-red-400">Não há reembolso</strong> após a entrega dos serviços, 
                  pois envolvemos equipe, tecnologia e tempo dedicado para desenvolver toda a estrutura.
                </p>
                <p className="text-sm text-gray-400">
                  Reembolso é possível apenas se nenhum serviço for prestado em até 15 dias após o pagamento da taxa.
                </p>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Seção 7 - Cancelamento */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. CANCELAMENTO</h3>
              <p className="leading-relaxed">
                Qualquer parte pode cancelar os serviços com aviso prévio de 5 dias úteis. 
                Falta de colaboração adequada pode resultar em encerramento imediato.
              </p>
            </div>

            {/* Contato */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Contato</h4>
              <div className="text-sm space-y-1">
                <p><strong>Empresa:</strong> Tráfego Porcents Marketing Digital LTDA</p>
                <p><strong>CNPJ:</strong> 60.697.779/0001-78</p>
                <p><strong>E-mail:</strong> contrato@trafegoporcents.com</p>
                <p><strong>Telefone:</strong> (11) 9 4306-4852</p>
                <p><strong>Site:</strong> trafegoporcents.com</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
          <Button
            onClick={handleRejeitarTermos}
            variant="outline"
            className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
            disabled={aceitando || rejeitando}
          >
            {rejeitando ? 'Rejeitando...' : 'Não Aceito'}
          </Button>
          <Button
            onClick={handleAceitarTermos}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            disabled={aceitando || rejeitando}
          >
            {aceitando ? 'Aceitando...' : 'Aceito os Termos e Condições'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
