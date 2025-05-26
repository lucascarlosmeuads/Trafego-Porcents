
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BriefingData {
  id: string
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

interface BriefingModalProps {
  emailCliente: string
  nomeCliente: string
  trigger: React.ReactNode
}

export function BriefingModal({ emailCliente, nomeCliente, trigger }: BriefingModalProps) {
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchBriefing = async () => {
    // Verificar se temos um email válido
    if (!emailCliente || emailCliente.trim() === '') {
      console.log('❌ [BriefingModal] Email do cliente não fornecido ou vazio')
      setBriefingData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    console.log('🔍 [BriefingModal] Buscando briefing para cliente:', {
      original: emailCliente,
      processed: emailCliente.trim().toLowerCase(),
      nomeCliente
    })

    try {
      const emailToSearch = emailCliente.trim().toLowerCase()
      
      // Primeira tentativa: busca exata
      const { data: exactData, error: exactError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailToSearch)
        .order('created_at', { ascending: false })
        .limit(1)

      console.log('📊 [BriefingModal] Busca exata:', { 
        emailToSearch, 
        found: exactData?.length || 0, 
        data: exactData, 
        error: exactError 
      })

      if (!exactError && exactData && exactData.length > 0) {
        console.log('✅ [BriefingModal] Briefing encontrado na busca exata:', exactData[0])
        setBriefingData(exactData[0])
        return
      }

      // Segunda tentativa: busca case-insensitive
      const { data: iLikeData, error: iLikeError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .ilike('email_cliente', emailToSearch)
        .order('created_at', { ascending: false })
        .limit(1)

      console.log('📊 [BriefingModal] Busca ilike:', { 
        emailToSearch, 
        found: iLikeData?.length || 0, 
        data: iLikeData, 
        error: iLikeError 
      })

      if (!iLikeError && iLikeData && iLikeData.length > 0) {
        console.log('✅ [BriefingModal] Briefing encontrado na busca ilike:', iLikeData[0])
        setBriefingData(iLikeData[0])
        return
      }

      // Terceira tentativa: buscar todos e filtrar manualmente
      const { data: allBriefings, error: allError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 [BriefingModal] Busca manual em todos os briefings:', {
        total: allBriefings?.length || 0,
        searchingFor: emailToSearch,
        allEmails: allBriefings?.map(b => `"${b.email_cliente}"`) || []
      })

      if (!allError && allBriefings) {
        // Filtrar manualmente com trim e lowercase
        const found = allBriefings.find(briefing => 
          briefing.email_cliente.trim().toLowerCase() === emailToSearch
        )

        if (found) {
          console.log('✅ [BriefingModal] Briefing encontrado na busca manual:', found)
          setBriefingData(found)
          return
        }
      }

      console.log('❌ [BriefingModal] Nenhum briefing encontrado para:', {
        emailOriginal: emailCliente,
        emailProcurado: emailToSearch,
        nomeCliente
      })
      setBriefingData(null)

    } catch (error) {
      console.error('💥 [BriefingModal] Erro na busca:', error)
      setBriefingData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && emailCliente) {
      fetchBriefing()
    }
  }, [open, emailCliente])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Briefing - {nomeCliente}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando briefing...</p>
            </div>
          </div>
        )}

        {!loading && !briefingData && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Briefing não preenchido</h3>
            <p className="text-muted-foreground mb-2">
              O cliente ainda não preencheu o formulário de briefing.
            </p>
            <p className="text-xs text-muted-foreground">
              Email buscado: {emailCliente}
            </p>
          </div>
        )}

        {!loading && briefingData && (
          <div className="space-y-6">
            {/* Header com informações básicas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Informações do Briefing</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Preenchido em {formatDate(briefingData.created_at)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Nome do Produto/Serviço</h4>
                  <p className="text-foreground">{briefingData.nome_produto || 'Não informado'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Descrição Resumida</h4>
                  <p className="text-foreground">{briefingData.descricao_resumida || 'Não informado'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Público Alvo</h4>
                    <p className="text-foreground">{briefingData.publico_alvo || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Diferencial</h4>
                    <p className="text-foreground">{briefingData.diferencial || 'Não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Investimento Diário</h4>
                    <p className="text-foreground">
                      {briefingData.investimento_diario 
                        ? `R$ ${Number(briefingData.investimento_diario).toFixed(2)}`
                        : 'Não informado'
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Comissão Aceita</h4>
                    <p className="text-foreground">{briefingData.comissao_aceita || 'Não informado'}</p>
                  </div>
                </div>

                {briefingData.observacoes_finais && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Observações Finais</h4>
                    <p className="text-foreground">{briefingData.observacoes_finais}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {briefingData.updated_at !== briefingData.created_at && (
              <div className="text-xs text-muted-foreground text-center">
                Última atualização: {formatDate(briefingData.updated_at)}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
