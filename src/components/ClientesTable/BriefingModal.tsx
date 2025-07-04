
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, AlertCircle, RefreshCw, Globe, Tag, Palette, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BriefingData {
  id: string
  nome_produto: string
  nome_marca: string | null
  descricao_resumida: string
  publico_alvo: string
  diferencial: string
  investimento_diario: number
  quer_site: boolean | null
  observacoes_finais: string
  // Novos campos da etapa 2
  direcionamento_campanha: string | null
  abrangencia_atendimento: string | null
  forma_pagamento: string | null
  possui_facebook: boolean | null
  possui_instagram: boolean | null
  utiliza_whatsapp_business: boolean | null
  // Novos campos da etapa 3
  criativos_prontos: boolean | null
  videos_prontos: boolean | null
  cores_desejadas: string | null
  tipo_fonte: string | null
  cores_proibidas: string | null
  fonte_especifica: string | null
  estilo_visual: string | null
  tipos_imagens_preferidas: string[] | null
  // Controle
  etapa_atual: number | null
  formulario_completo: boolean | null
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

  const getProgressBadge = (etapaAtual: number | null, formularioCompleto: boolean | null) => {
    if (formularioCompleto) {
      return <Badge className="bg-green-500 hover:bg-green-600">✅ Completo</Badge>
    }
    if (etapaAtual) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        📝 Etapa {etapaAtual}/3
      </Badge>
    }
    return <Badge variant="secondary">📋 Formulário Básico</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Formulário de Gestão de Tráfego - {nomeCliente}
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
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground mb-4">Email procurado: {emailCliente}</p>
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
            <p className="text-xs text-muted-foreground mb-4">Email: {emailCliente}</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar novamente
            </Button>
          </div>
        )}

        {!loading && !error && briefingData && (
          <div className="space-y-6">
            {/* Header com Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Status do Formulário</CardTitle>
                  <div className="flex gap-2">
                    {getProgressBadge(briefingData.etapa_atual, briefingData.formulario_completo)}
                    <Badge variant="outline" className="text-xs">
                      Preenchido em {formatDate(briefingData.created_at)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Etapa 1 - Informações do Negócio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Etapa 1 - Informações do Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">📦 Nome do Produto/Serviço</h4>
                    <p className="text-foreground">{briefingData.nome_produto || 'Não informado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">🏷️ Nome da Marca</h4>
                    <p className="text-foreground">{briefingData.nome_marca || 'Não informado'}</p>
                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">🌐 Quer Site?</h4>
                    <Badge 
                      variant={briefingData.quer_site ? "default" : "secondary"}
                      className={briefingData.quer_site ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {briefingData.quer_site === true ? "✅ Sim" : briefingData.quer_site === false ? "❌ Não" : "❓ Não respondido"}
                    </Badge>
                  </div>
                </div>

                {briefingData.observacoes_finais && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">💬 Observações Finais</h4>
                    <p className="text-foreground">{briefingData.observacoes_finais}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Etapa 2 - Informações da Campanha */}
            {(briefingData.direcionamento_campanha || briefingData.abrangencia_atendimento || briefingData.forma_pagamento || 
              briefingData.possui_facebook !== null || briefingData.possui_instagram !== null || briefingData.utiliza_whatsapp_business !== null) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-green-500" />
                    Etapa 2 - Informações da Campanha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {briefingData.direcionamento_campanha && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">🎯 Direcionamento</h4>
                        <Badge variant="outline">
                          {briefingData.direcionamento_campanha === 'whatsapp' ? '📱 WhatsApp' : '🌐 Site'}
                        </Badge>
                      </div>
                    )}
                    {briefingData.abrangencia_atendimento && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">📍 Abrangência</h4>
                        <Badge variant="outline">
                          {briefingData.abrangencia_atendimento === 'brasil' ? '🇧🇷 Todo Brasil' : '📍 Região'}
                        </Badge>
                      </div>
                    )}
                    {briefingData.forma_pagamento && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">💳 Pagamento</h4>
                        <Badge variant="outline">
                          {briefingData.forma_pagamento === 'cartao' ? '💳 Cartão' : 
                           briefingData.forma_pagamento === 'pix' ? '📱 Pix' : '🧾 Boleto'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">📱 Contas Sociais</h4>
                    <div className="flex gap-2 flex-wrap">
                      {briefingData.possui_facebook !== null && (
                        <Badge variant={briefingData.possui_facebook ? "default" : "secondary"}>
                          {briefingData.possui_facebook ? '✅ Facebook' : '❌ Facebook'}
                        </Badge>
                      )}
                      {briefingData.possui_instagram !== null && (
                        <Badge variant={briefingData.possui_instagram ? "default" : "secondary"}>
                          {briefingData.possui_instagram ? '✅ Instagram' : '❌ Instagram'}
                        </Badge>
                      )}
                      {briefingData.utiliza_whatsapp_business !== null && (
                        <Badge variant={briefingData.utiliza_whatsapp_business ? "default" : "secondary"}>
                          {briefingData.utiliza_whatsapp_business ? '✅ WhatsApp Business' : '❌ WhatsApp Business'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 3 - Criativos */}
            {(briefingData.criativos_prontos !== null || briefingData.videos_prontos !== null || 
              briefingData.cores_desejadas || briefingData.tipo_fonte || briefingData.estilo_visual || 
              briefingData.cores_proibidas || briefingData.fonte_especifica || briefingData.tipos_imagens_preferidas) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    Etapa 3 - Criativos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {briefingData.criativos_prontos !== null && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">🎨 Criativos Prontos</h4>
                        <Badge variant={briefingData.criativos_prontos ? "default" : "secondary"}>
                          {briefingData.criativos_prontos ? '✅ Sim' : '❌ Não'}
                        </Badge>
                      </div>
                    )}
                    {briefingData.videos_prontos !== null && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">🎬 Vídeos Prontos</h4>
                        <Badge variant={briefingData.videos_prontos ? "default" : "secondary"}>
                          {briefingData.videos_prontos ? '✅ Sim' : '❌ Não'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {briefingData.cores_desejadas && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">🎨 Cores Desejadas</h4>
                        <p className="text-foreground">{briefingData.cores_desejadas}</p>
                      </div>
                    )}
                    {briefingData.tipo_fonte && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">🔤 Tipo de Fonte</h4>
                        <Badge variant="outline">
                          {briefingData.tipo_fonte.charAt(0).toUpperCase() + briefingData.tipo_fonte.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {briefingData.cores_proibidas && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">🚫 Cores Proibidas</h4>
                      <p className="text-foreground">{briefingData.cores_proibidas}</p>
                    </div>
                  )}

                  {briefingData.fonte_especifica && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">📝 Fonte Específica</h4>
                      <p className="text-foreground">{briefingData.fonte_especifica}</p>
                    </div>
                  )}

                  {briefingData.estilo_visual && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">✨ Estilo Visual</h4>
                      <Badge variant="outline">
                        {briefingData.estilo_visual === 'limpo' ? '🎯 Visual Limpo' : '🎨 Visual com Elementos'}
                      </Badge>
                    </div>
                  )}

                  {briefingData.tipos_imagens_preferidas && briefingData.tipos_imagens_preferidas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">📸 Tipos de Imagens Preferidas</h4>
                      <div className="flex gap-2 flex-wrap">
                        {briefingData.tipos_imagens_preferidas.map((tipo, index) => (
                          <Badge key={index} variant="outline">
                            <Camera className="w-3 h-3 mr-1" />
                            {tipo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
