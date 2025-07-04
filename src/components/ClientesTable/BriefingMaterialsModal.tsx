import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Folder,
  Building,
  Target,
  Palette,
  FileText,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ClienteArquivos } from './ClienteArquivos'

interface BriefingMaterialsModalProps {
  emailCliente: string
  clienteName: string
  trigger?: React.ReactNode
  open?: boolean
  onClose?: () => void
}

const formatTipoPrestacao = (tipo: string) => {
  switch (tipo) {
    case 'produto_digital':
      return 'Venda produto digital';
    case 'produto_fisico':
      return 'Venda produto físico';
    case 'servico':
      return 'Venda serviço';
    default:
      return 'Não informado';
  }
};

export function BriefingMaterialsModal({ 
  emailCliente, 
  clienteName, 
  trigger, 
  open, 
  onClose 
}: BriefingMaterialsModalProps) {
  const [briefing, setBriefing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBriefing = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Briefing não encontrado')
        } else {
          setError(`Erro ao carregar briefing: ${error.message}`)
        }
        return
      }

      setBriefing(data)
    } catch (err) {
      setError('Erro inesperado ao carregar briefing')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      fetchBriefing()
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            Briefing e Materiais - {clienteName}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas do briefing do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Erro</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {briefing && (
            <>
              {/* Seção 1: Informações do Negócio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Informações do Negócio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
                      <p className="mt-1 text-gray-900">{briefing.nome_produto || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome da Marca</label>
                      <p className="mt-1 text-gray-900">{briefing.nome_marca || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descrição Resumida</label>
                    <p className="mt-1 text-gray-900">{briefing.descricao_resumida || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Público-Alvo</label>
                    <p className="mt-1 text-gray-900">{briefing.publico_alvo || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Diferencial</label>
                    <p className="mt-1 text-gray-900">{briefing.diferencial || 'Não informado'}</p>
                  </div>
                  
                  {briefing.observacoes_finais && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Observações Finais</label>
                      <p className="mt-1 text-gray-900">{briefing.observacoes_finais}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Quer Site</label>
                    <p className="mt-1 text-gray-900">{briefing.quer_site ? 'Sim' : 'Não'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Seção 2: Informações da Campanha */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Informações da Campanha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Investimento Diário</label>
                      <p className="mt-1 text-gray-900">
                        {briefing.investimento_diario ? `R$ ${briefing.investimento_diario}` : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Direcionamento</label>
                      <p className="mt-1 text-gray-900">
                        {briefing.direcionamento_campanha === 'whatsapp' ? 'WhatsApp' : 
                         briefing.direcionamento_campanha === 'site' ? 'Site' : 'Não informado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Abrangência</label>
                      <p className="mt-1 text-gray-900">
                        {briefing.abrangencia_atendimento === 'brasil' ? 'Todo o Brasil' : 
                         briefing.abrangencia_atendimento === 'regiao' ? 'Somente sua região' : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo de Prestação</label>
                      <p className="mt-1 text-gray-900">
                        {formatTipoPrestacao(briefing.tipo_prestacao_servico)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Forma de Pagamento</label>
                    <p className="mt-1 text-gray-900">
                      {briefing.forma_pagamento === 'cartao' ? 'Cartão de crédito' : 
                       briefing.forma_pagamento === 'pix' ? 'Pix' : 
                       briefing.forma_pagamento === 'boleto' ? 'Boleto' : 'Não informado'}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${briefing.possui_facebook ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">Possui Facebook</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${briefing.possui_instagram ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">Possui Instagram</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${briefing.utiliza_whatsapp_business ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">WhatsApp Business</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção 3: Criativos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    Criativos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${briefing.criativos_prontos ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">Possui criativos prontos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${briefing.videos_prontos ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">Possui vídeos prontos</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cores Desejadas</label>
                      <p className="mt-1 text-gray-900">{briefing.cores_desejadas || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo de Fonte</label>
                      <p className="mt-1 text-gray-900 capitalize">{briefing.tipo_fonte || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  {briefing.cores_proibidas && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Cores Proibidas</label>
                      <p className="mt-1 text-gray-900">{briefing.cores_proibidas}</p>
                    </div>
                  )}
                  
                  {briefing.fonte_especifica && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fonte Específica</label>
                      <p className="mt-1 text-gray-900">{briefing.fonte_especifica}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estilo Visual</label>
                    <p className="mt-1 text-gray-900">
                      {briefing.estilo_visual === 'limpo' ? 'Visual Limpo' : 
                       briefing.estilo_visual === 'elementos' ? 'Visual com Mais Elementos' : 'Não informado'}
                    </p>
                  </div>
                  
                  {briefing.tipos_imagens_preferidas && briefing.tipos_imagens_preferidas.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipos de Imagens Preferidas</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {briefing.tipos_imagens_preferidas.map((tipo: string) => (
                          <Badge key={tipo} variant="secondary" className="text-xs">
                            {tipo.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Seção 4: Status do Formulário */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Status do Formulário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Etapa Atual</label>
                      <p className="mt-1 text-gray-900">{briefing.etapa_atual || 'Não informado'} de 3</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Formulário Completo</label>
                      <p className="mt-1 text-gray-900">{briefing.formulario_completo ? 'Sim' : 'Não'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Última Atualização</label>
                      <p className="mt-1 text-gray-900">
                        {briefing.updated_at ? new Date(briefing.updated_at).toLocaleDateString('pt-BR') : 'Não informado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seção 5: Arquivos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Arquivos do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClienteArquivos emailCliente={emailCliente} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
