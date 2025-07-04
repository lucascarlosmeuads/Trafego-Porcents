
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  User, 
  Building2, 
  Target, 
  Star, 
  MessageSquare,
  Globe,
  CreditCard,
  Palette,
  Type,
  Image,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Smartphone,
  Facebook,
  Instagram,
  MessageCircle,
  Eye,
  Briefcase
} from 'lucide-react'

interface BriefingMaterialsModalProps {
  open: boolean
  onClose: () => void
  briefing: any
  clienteName?: string
}

export function BriefingMaterialsModal({ 
  open, 
  onClose, 
  briefing, 
  clienteName 
}: BriefingMaterialsModalProps) {
  if (!briefing) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Materiais do Briefing
              {clienteName && <span className="text-muted-foreground">- {clienteName}</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum briefing encontrado para este cliente.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const formatTipoPrestacao = (tipo: string) => {
    const tipos = {
      'produto_digital': 'Venda produto digital',
      'produto_fisico': 'Venda produto físico', 
      'servico': 'Venda serviço'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const formatAbrangencia = (abrangencia: string) => {
    return abrangencia === 'brasil' ? 'Todo o Brasil' : 'Somente sua região'
  }

  const formatFormaPagamento = (forma: string) => {
    const formas = {
      'cartao': 'Cartão de crédito',
      'pix': 'Pix',
      'boleto': 'Boleto'
    }
    return formas[forma as keyof typeof formas] || forma
  }

  const formatDirecionamento = (direcionamento: string) => {
    return direcionamento === 'whatsapp' ? 'WhatsApp' : 'Site'
  }

  const formatTipoFonte = (tipo: string) => {
    const tipos = {
      'moderna': 'Moderna',
      'serifada': 'Serifada',
      'bold': 'Bold',
      'minimalista': 'Minimalista',
      'tech': 'Tech',
      'retro': 'Retrô'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const formatEstiloVisual = (estilo: string) => {
    return estilo === 'limpo' ? 'Visual Limpo' : 'Visual com Mais Elementos'
  }

  const formatTiposImagens = (tipos: string[]) => {
    const mapeamento = {
      'pessoas-reais': 'Pessoas reais',
      'mockups-produto': 'Mockups de produto',
      'vetores-ilustrativos': 'Vetores ilustrativos',
      'fundos-texturizados': 'Fundos texturizados',
      'outro': 'Outro'
    }
    return tipos?.map(tipo => mapeamento[tipo as keyof typeof mapeamento] || tipo).join(', ') || '-'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Materiais do Briefing
            {clienteName && <span className="text-muted-foreground">- {clienteName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção 1: Informações do Negócio */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
              <Building2 className="h-5 w-5" />
              Informações do Negócio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Produto:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">{briefing.nome_produto || '-'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Marca:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">{briefing.nome_marca || '-'}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Descrição:</span>
              </div>
              <p className="text-sm bg-white p-3 rounded border">{briefing.descricao_resumida || '-'}</p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Público-alvo:</span>
              </div>
              <p className="text-sm bg-white p-3 rounded border">{briefing.publico_alvo || '-'}</p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Diferencial:</span>
              </div>
              <p className="text-sm bg-white p-3 rounded border">{briefing.diferencial || '-'}</p>
            </div>

            {briefing.observacoes_finais && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Observações:</span>
                </div>
                <p className="text-sm bg-white p-3 rounded border">{briefing.observacoes_finais}</p>
              </div>
            )}

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Quer site:</span>
                {briefing.quer_site ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 2: Informações da Campanha */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              Informações da Campanha
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Investimento diário:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.investimento_diario ? `R$ ${briefing.investimento_diario}` : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Direcionamento:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.direcionamento_campanha ? formatDirecionamento(briefing.direcionamento_campanha) : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tipo de prestação:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.tipo_prestacao_servico ? formatTipoPrestacao(briefing.tipo_prestacao_servico) : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Abrangência:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.abrangencia_atendimento ? formatAbrangencia(briefing.abrangencia_atendimento) : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Forma de pagamento:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.forma_pagamento ? formatFormaPagamento(briefing.forma_pagamento) : '-'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Facebook:</span>
                {briefing.possui_facebook ? (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                <span className="font-medium">Instagram:</span>
                {briefing.possui_instagram ? (
                  <Badge variant="default" className="bg-pink-100 text-pink-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">WhatsApp Business:</span>
                {briefing.utiliza_whatsapp_business ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 3: Criativos */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
              <Palette className="h-5 w-5" />
              Criativos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Criativos prontos:</span>
                {briefing.criativos_prontos ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Vídeos prontos:</span>
                {briefing.videos_prontos ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Sim
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Não
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Cores desejadas:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">{briefing.cores_desejadas || '-'}</p>
              </div>
              
              {briefing.cores_proibidas && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Cores proibidas:</span>
                  </div>
                  <p className="text-sm bg-white p-2 rounded border">{briefing.cores_proibidas}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tipo de fonte:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.tipo_fonte ? formatTipoFonte(briefing.tipo_fonte) : '-'}
                </p>
              </div>
              
              {briefing.fonte_especifica && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Fonte específica:</span>
                  </div>
                  <p className="text-sm bg-white p-2 rounded border">{briefing.fonte_especifica}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Estilo visual:</span>
                </div>
                <p className="text-sm bg-white p-2 rounded border">
                  {briefing.estilo_visual ? formatEstiloVisual(briefing.estilo_visual) : '-'}
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Tipos de imagens preferidas:</span>
              </div>
              <p className="text-sm bg-white p-3 rounded border">
                {formatTiposImagens(briefing.tipos_imagens_preferidas)}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
