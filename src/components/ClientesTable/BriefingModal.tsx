import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, AlertCircle, RefreshCw, Globe, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BriefingData {
  id: string
  nome_produto: string
  descricao_resumida: string
  publico_alvo: string
  diferencial: string
  investimento_diario: number
  quer_site: boolean
  nome_marca: string | null
  comissao_aceita: string
  observacoes_finais: string
  created_at: string
  updated_at: string
  email_cliente: string
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
  const [error, setError] = useState<string | null>(null)

  const fetchBriefing = async () => {
    if (!emailCliente || emailCliente.trim() === '') {
      console.log('❌ [BriefingModal] Email do cliente não fornecido')
      setBriefingData(null)
      setError('Email do cliente não fornecido')
      return
    }

    setLoading(true)
    setError(null)
    
    const emailToSearch = emailCliente.trim().toLowerCase()
    
    console.log('🔍 [BriefingModal] INICIANDO busca de briefing:', {
      emailOriginal: emailCliente,
      emailProcessado: emailToSearch,
      nomeCliente
    })

    try {
      // ESTRATÉGIA MELHORADA: Buscar todos os briefings e filtrar manualmente
      const { data: allBriefings, error: fetchError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 [BriefingModal] Resultado da busca:', {
        totalBriefings: allBriefings?.length || 0,
        error: fetchError,
        allEmails: allBriefings?.map(b => `"${b.email_cliente}"`) || []
      })

      if (fetchError) {
        console.error('❌ [BriefingModal] Erro na consulta:', fetchError)
        setError(`Erro na consulta: ${fetchError.message}`)
        setBriefingData(null)
        return
      }

      if (!allBriefings || allBriefings.length === 0) {
        console.log('❌ [BriefingModal] Nenhum briefing encontrado na tabela')
        setError('Nenhum briefing encontrado na base de dados')
        setBriefingData(null)
        return
      }

      // Filtrar com múltiplas estratégias
      let foundBriefing = null

      // 1. Busca exata
      foundBriefing = allBriefings.find(briefing => 
        briefing.email_cliente?.trim().toLowerCase() === emailToSearch
      )

      if (foundBriefing) {
        console.log('✅ [BriefingModal] Match exato encontrado:', foundBriefing)
      } else {
        // 2. Busca sem espaços
        foundBriefing = allBriefings.find(briefing => 
          briefing.email_cliente?.replace(/\s+/g, '').toLowerCase() === emailToSearch.replace(/\s+/g, '')
        )

        if (foundBriefing) {
          console.log('✅ [BriefingModal] Match sem espaços encontrado:', foundBriefing)
        } else {
          // 3. Busca parcial (contém)
          foundBriefing = allBriefings.find(briefing => 
            briefing.email_cliente?.toLowerCase().includes(emailToSearch) ||
            emailToSearch.includes(briefing.email_cliente?.toLowerCase())
          )

          if (foundBriefing) {
            console.log('✅ [BriefingModal] Match parcial encontrado:', foundBriefing)
          }
        }
      }

      if (foundBriefing) {
        console.log('🎉 [BriefingModal] BRIEFING ENCONTRADO:', {
          id: foundBriefing.id,
          email: foundBriefing.email_cliente,
          produto: foundBriefing.nome_produto,
          criadoEm: foundBriefing.created_at
        })
        setBriefingData(foundBriefing)
        setError(null)
      } else {
        console.log('❌ [BriefingModal] BRIEFING NÃO ENCONTRADO:', {
          emailProcurado: emailToSearch,
          emailsDisponíveis: allBriefings.map(b => b.email_cliente),
          totalRegistros: allBriefings.length
        })
        setError(`Briefing não encontrado para o email: ${emailCliente}`)
        setBriefingData(null)
      }

    } catch (error) {
      console.error('💥 [BriefingModal] Erro inesperado:', error)
      setError(`Erro inesperado: ${error}`)
      setBriefingData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && emailCliente) {
      console.log('🔄 [BriefingModal] Modal aberto, iniciando busca...')
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

  const handleRetry = () => {
    console.log('🔄 [BriefingModal] Tentando novamente...')
    fetchBriefing()
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

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar briefing</h3>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Email procurado: {emailCliente}
            </p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        )}

        {!loading && !error && !briefingData && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Briefing não encontrado</h3>
            <p className="text-muted-foreground mb-2">
              Não foi possível encontrar o briefing para este cliente.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Email: {emailCliente}
            </p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar novamente
            </Button>
          </div>
        )}

        {!loading && !error && briefingData && (
          <div className="space-y-6">
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
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">📦 Nome do Produto/Serviço</h4>
                  <p className="text-foreground">{briefingData.nome_produto || 'Não informado'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">💰 Investimento Diário</h4>
                  <p className="text-foreground">
                    {briefingData.investimento_diario 
                      ? `R$ ${Number(briefingData.investimento_diario).toFixed(2)}`
                      : 'Não informado'
                    }
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">📝 Descrição Resumida</h4>
                  <p className="text-foreground">{briefingData.descricao_resumida || 'Não informado'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">🎯 Público Alvo</h4>
                    <p className="text-foreground">{briefingData.publico_alvo || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">⭐ Diferencial</h4>
                    <p className="text-foreground">{briefingData.diferencial || 'Não informado'}</p>
                  </div>
                </div>

                {/* Nova seção para Site */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-sm text-blue-800 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    🌐 Informações do Site
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">Quer Site?</p>
                      <Badge 
                        variant={briefingData.quer_site ? "default" : "secondary"}
                        className={briefingData.quer_site ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {briefingData.quer_site ? "✅ Sim" : "❌ Não"}
                      </Badge>
                    </div>
                    {briefingData.quer_site && (
                      <div>
                        <p className="text-xs text-blue-600 font-medium mb-1">🏷️ Nome da Marca</p>
                        <p className="text-blue-800 font-medium">
                          {briefingData.nome_marca || 'Não informado'}
                        </p>
                        {briefingData.nome_marca && (
                          <p className="text-xs text-blue-600 mt-1">
                            ⚠️ Cliente deve enviar logo na seção Materiais
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {briefingData.observacoes_finais && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">💬 Observações Finais</h4>
                    <p className="text-foreground">{briefingData.observacoes_finais}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Email do Cliente</h4>
                  <p className="text-foreground text-xs">{briefingData.email_cliente}</p>
                </div>
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
