
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Eye, Calendar, User, Package, CheckCircle, Clock, FileText, Tag, Palette } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BriefingCliente } from '@/hooks/useClienteData'
import { toast } from '@/hooks/use-toast'

export function BriefingsPanel() {
  const [briefings, setBriefings] = useState<BriefingCliente[]>([])
  const [filteredBriefings, setFilteredBriefings] = useState<BriefingCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBriefing, setSelectedBriefing] = useState<BriefingCliente | null>(null)
  const [processingBriefing, setProcessingBriefing] = useState<string | null>(null)

  const fetchBriefings = async () => {
    try {
      setLoading(true)
      console.log('🔍 [BriefingsPanel] Buscando todos os formulários de briefing...')

      const { data, error } = await supabase
        .from('briefings_cliente')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [BriefingsPanel] Erro ao buscar briefings:', error)
        return
      }

      console.log('✅ [BriefingsPanel] Briefings carregados:', data?.length || 0)
      setBriefings(data || [])
      setFilteredBriefings(data || [])
    } catch (error) {
      console.error('💥 [BriefingsPanel] Erro crítico:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsProcessed = async (briefingId: string) => {
    setProcessingBriefing(briefingId)
    
    try {
      console.log('✅ [BriefingsPanel] Marcando briefing como processado:', briefingId)
      
      const { error } = await supabase
        .from('briefings_cliente')
        .update({ 
          liberar_edicao: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', briefingId)

      if (error) {
        console.error('❌ Erro ao marcar briefing como processado:', error)
        toast({
          title: "Erro",
          description: "Falha ao marcar briefing como processado",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Briefing marcado como processado e bloqueado para edição",
      })

      // Atualizar a lista local
      setBriefings(prev => 
        prev.map(b => 
          b.id === briefingId 
            ? { ...b, liberar_edicao: false, updated_at: new Date().toISOString() }
            : b
        )
      )
      
      setFilteredBriefings(prev => 
        prev.map(b => 
          b.id === briefingId 
            ? { ...b, liberar_edicao: false, updated_at: new Date().toISOString() }
            : b
        )
      )
      
    } catch (error) {
      console.error('💥 Erro ao marcar briefing:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar briefing",
        variant: "destructive",
      })
    } finally {
      setProcessingBriefing(null)
    }
  }

  useEffect(() => {
    fetchBriefings()

    // Configurar realtime para atualizações automáticas
    const channel = supabase
      .channel('briefings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'briefings_cliente'
        },
        (payload) => {
          console.log('🔄 [BriefingsPanel] Mudança detectada em briefings:', payload)
          fetchBriefings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBriefings(briefings)
      return
    }

    const filtered = briefings.filter(briefing =>
      briefing.email_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      briefing.nome_produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (briefing.nome_marca && briefing.nome_marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (briefing.descricao_resumida && briefing.descricao_resumida.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    setFilteredBriefings(filtered)
  }, [searchTerm, briefings])

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getProgressBadge = (briefing: BriefingCliente) => {
    if (briefing.formulario_completo) {
      return <Badge className="bg-green-500 hover:bg-green-600 text-xs">✅ Completo</Badge>
    }
    if (briefing.etapa_atual && briefing.etapa_atual > 1) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
        📝 Etapa {briefing.etapa_atual}/3
      </Badge>
    }
    return <Badge variant="secondary" className="text-xs">📋 Básico</Badge>
  }

  const BriefingDetailsModal = ({ briefing }: { briefing: BriefingCliente }) => (
    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Formulário: {briefing.nome_produto}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Cliente</label>
              <p className="text-sm">{briefing.email_cliente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="mt-1">{getProgressBadge(briefing)}</div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Data de Criação</label>
            <p className="text-sm">
              {new Date(briefing.created_at).toLocaleDateString('pt-BR')} às {new Date(briefing.created_at).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Etapa 1 - Informações do Negócio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              Etapa 1 - Informações do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome do Produto</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{briefing.nome_produto}</p>
              </div>
              {briefing.nome_marca && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome da Marca</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{briefing.nome_marca}</p>
                </div>
              )}
            </div>

            {briefing.descricao_resumida && (
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição Resumida</label>
                <p className="text-sm bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{briefing.descricao_resumida}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {briefing.publico_alvo && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Público Alvo</label>
                  <p className="text-sm bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{briefing.publico_alvo}</p>
                </div>
              )}
              {briefing.diferencial && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Diferencial do Produto</label>
                  <p className="text-sm bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{briefing.diferencial}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Investimento Diário</label>
                <p className="text-sm bg-gray-50 p-2 rounded">{formatCurrency(briefing.investimento_diario)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quer Site</label>
                <Badge variant={briefing.quer_site ? "default" : "secondary"} className="ml-2">
                  {briefing.quer_site ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
            </div>

            {briefing.observacoes_finais && (
              <div>
                <label className="text-sm font-medium text-gray-600">Observações Finais</label>
                <p className="text-sm bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{briefing.observacoes_finais}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Etapa 2 - Informações da Campanha (se preenchida) */}
        {(briefing.direcionamento_campanha || briefing.abrangencia_atendimento || briefing.forma_pagamento) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-green-500" />
                Etapa 2 - Informações da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {briefing.direcionamento_campanha && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Direcionamento</label>
                    <Badge variant="outline" className="ml-2">
                      {briefing.direcionamento_campanha === 'whatsapp' ? '📱 WhatsApp' : '🌐 Site'}
                    </Badge>
                  </div>
                )}
                {briefing.abrangencia_atendimento && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Abrangência</label>
                    <Badge variant="outline" className="ml-2">
                      {briefing.abrangencia_atendimento === 'brasil' ? '🇧🇷 Brasil' : '📍 Região'}
                    </Badge>
                  </div>
                )}
                {briefing.forma_pagamento && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pagamento</label>
                    <Badge variant="outline" className="ml-2">
                      {briefing.forma_pagamento === 'cartao' ? '💳 Cartão' : 
                       briefing.forma_pagamento === 'pix' ? '📱 Pix' : '🧾 Boleto'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Contas Sociais */}
              {(briefing.possui_facebook !== null || briefing.possui_instagram !== null || briefing.utiliza_whatsapp_business !== null) && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Contas Sociais</label>
                  <div className="flex gap-2 mt-1">
                    {briefing.possui_facebook !== null && (
                      <Badge variant={briefing.possui_facebook ? "default" : "secondary"}>
                        {briefing.possui_facebook ? '✅ Facebook' : '❌ Facebook'}
                      </Badge>
                    )}
                    {briefing.possui_instagram !== null && (
                      <Badge variant={briefing.possui_instagram ? "default" : "secondary"}>
                        {briefing.possui_instagram ? '✅ Instagram' : '❌ Instagram'}
                      </Badge>
                    )}
                    {briefing.utiliza_whatsapp_business !== null && (
                      <Badge variant={briefing.utiliza_whatsapp_business ? "default" : "secondary"}>
                        {briefing.utiliza_whatsapp_business ? '✅ WhatsApp Business' : '❌ WhatsApp Business'}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Etapa 3 - Criativos (se preenchida) */}
        {(briefing.cores_desejadas || briefing.tipo_fonte || briefing.estilo_visual || 
          briefing.criativos_prontos !== null || briefing.videos_prontos !== null) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-purple-500" />
                Etapa 3 - Criativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {briefing.criativos_prontos !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Criativos Prontos</label>
                    <Badge variant={briefing.criativos_prontos ? "default" : "secondary"} className="ml-2">
                      {briefing.criativos_prontos ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                )}
                {briefing.videos_prontos !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vídeos Prontos</label>
                    <Badge variant={briefing.videos_prontos ? "default" : "secondary"} className="ml-2">
                      {briefing.videos_prontos ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                )}
              </div>

              {briefing.cores_desejadas && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Cores Desejadas</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{briefing.cores_desejadas}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {briefing.tipo_fonte && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Fonte</label>
                    <Badge variant="outline" className="ml-2">
                      {briefing.tipo_fonte.charAt(0).toUpperCase() + briefing.tipo_fonte.slice(1)}
                    </Badge>
                  </div>
                )}
                {briefing.estilo_visual && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estilo Visual</label>
                    <Badge variant="outline" className="ml-2">
                      {briefing.estilo_visual === 'limpo' ? '🎯 Limpo' : '🎨 Com Elementos'}
                    </Badge>
                  </div>
                )}
              </div>

              {briefing.cores_proibidas && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Cores Proibidas</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{briefing.cores_proibidas}</p>
                </div>
              )}

              {briefing.fonte_especifica && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fonte Específica</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{briefing.fonte_especifica}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium text-gray-600">Status de Edição</label>
            <div className="mt-1">
              <Badge variant={briefing.liberar_edicao ? "default" : "secondary"}>
                {briefing.liberar_edicao ? "Edição Liberada" : "Processado"}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Última Atualização</label>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {formatDistanceToNow(new Date(briefing.updated_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          {briefing.liberar_edicao && (
            <Button
              onClick={() => markAsProcessed(briefing.id)}
              disabled={processingBriefing === briefing.id}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingBriefing === briefing.id ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Processado
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Carregando formulários...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Formulários de Gestão de Tráfego</h2>
          <p className="text-gray-600">Visualize todos os briefings preenchidos pelos clientes</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {briefings.length} formulários
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por email, produto, marca ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchBriefings} variant="outline">
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredBriefings.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                {searchTerm ? 'Nenhum briefing encontrado com os critérios de busca.' : 'Nenhum formulário de briefing foi preenchido ainda.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBriefings.map((briefing) => (
            <Card key={briefing.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="w-4 h-4" />
                      {briefing.nome_produto}
                      {briefing.nome_marca && (
                        <Badge variant="outline" className="text-xs">
                          {briefing.nome_marca}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {briefing.email_cliente}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(briefing.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getProgressBadge(briefing)}
                    <Badge variant={briefing.liberar_edicao ? "default" : "secondary"} className="text-xs">
                      {briefing.liberar_edicao ? "Editável" : "Processado"}
                    </Badge>
                    {briefing.liberar_edicao && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsProcessed(briefing.id)}
                        disabled={processingBriefing === briefing.id}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        {processingBriefing === briefing.id ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBriefing(briefing)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      {selectedBriefing && <BriefingDetailsModal briefing={selectedBriefing} />}
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Investimento:</span>
                    <p className="text-gray-800">{formatCurrency(briefing.investimento_diario)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Progresso:</span>
                    <p className="text-gray-800">
                      {briefing.formulario_completo ? 'Completo' : 
                       briefing.etapa_atual ? `Etapa ${briefing.etapa_atual}/3` : 'Básico'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Última Atualização:</span>
                    <p className="text-gray-800">
                      {new Date(briefing.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {briefing.descricao_resumida && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-gray-600 text-sm">Descrição:</span>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                      {briefing.descricao_resumida}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
