
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Eye, Calendar, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BriefingData {
  nome_produto: string
  descricao_resumida: string
  publico_alvo: string
  diferencial: string
  investimento_diario: number
  comissao_aceita: string
  observacoes_finais: string
  created_at: string
  updated_at: string
}

interface BriefingStatusCellProps {
  emailCliente: string
  nomeCliente: string
}

export function BriefingStatusCell({ emailCliente, nomeCliente }: BriefingStatusCellProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchBriefing = async () => {
    if (!emailCliente || loading) return

    setLoading(true)
    console.log('🔍 [BriefingStatusCell] Buscando briefing para:', emailCliente)
    
    try {
      const { data: briefingData, error } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .maybeSingle()

      if (error) {
        console.error('❌ [BriefingStatusCell] Erro ao buscar briefing:', error)
        setBriefing(null)
      } else {
        console.log('✅ [BriefingStatusCell] Briefing encontrado:', !!briefingData)
        setBriefing(briefingData)
      }
    } catch (error) {
      console.error('💥 [BriefingStatusCell] Erro crítico:', error)
      setBriefing(null)
    } finally {
      setLoading(false)
    }
  }

  // Buscar briefing quando o componente carregar
  useEffect(() => {
    fetchBriefing()
  }, [emailCliente])

  // Se ainda não carregou
  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Carregando...</span>
      </div>
    )
  }

  // Se não tem briefing
  if (!briefing) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        ❌ Não preenchido
      </Badge>
    )
  }

  // Se tem briefing - mostrar botão para visualizar
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <Eye className="w-3 h-3 mr-1" />
          Ver Briefing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Briefing de {nomeCliente}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{emailCliente}</p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="w-5 h-5" />
                📋 Formulário Preenchido pelo Cliente
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Calendar className="w-3 h-3" />
                Preenchido em {new Date(briefing.created_at).toLocaleDateString('pt-BR')}
                {briefing.updated_at !== briefing.created_at && (
                  <span>• Atualizado em {new Date(briefing.updated_at).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">📦 Nome do Produto</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-200">
                    {briefing.nome_produto || 'Não informado'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">💰 Investimento Diário</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-200">
                    R$ {briefing.investimento_diario ? briefing.investimento_diario.toFixed(2) : 'Não informado'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-700">📝 Descrição Resumida</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-200 whitespace-pre-wrap">
                  {briefing.descricao_resumida || 'Não informado'}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-700">🎯 Público-Alvo</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-200 whitespace-pre-wrap">
                  {briefing.publico_alvo || 'Não informado'}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2 text-green-700">⭐ Diferencial do Produto</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-200 whitespace-pre-wrap">
                  {briefing.diferencial || 'Não informado'}
                </p>
              </div>
              
              {briefing.observacoes_finais && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">💬 Observações Finais</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border border-green-200 whitespace-pre-wrap">
                    {briefing.observacoes_finais}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-green-700">💼 Comissão Aceita:</h4>
                <Badge variant={briefing.comissao_aceita === 'sim' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                  {briefing.comissao_aceita === 'sim' ? '✅ Sim' : briefing.comissao_aceita === 'nao' ? '❌ Não' : briefing.comissao_aceita || '❓ Não informado'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
