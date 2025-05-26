
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Eye, Calendar, User, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BriefingCliente } from '@/hooks/useClienteData'

export function BriefingsPanel() {
  const [briefings, setBriefings] = useState<BriefingCliente[]>([])
  const [filteredBriefings, setFilteredBriefings] = useState<BriefingCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBriefing, setSelectedBriefing] = useState<BriefingCliente | null>(null)

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

  const BriefingDetailsModal = ({ briefing }: { briefing: BriefingCliente }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Briefing: {briefing.nome_produto}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Cliente</label>
            <p className="text-sm bg-gray-50 p-2 rounded">{briefing.email_cliente}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Data de Criação</label>
            <p className="text-sm bg-gray-50 p-2 rounded">
              {new Date(briefing.created_at).toLocaleDateString('pt-BR')} às {new Date(briefing.created_at).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Nome do Produto</label>
          <p className="text-sm bg-gray-50 p-3 rounded mt-1">{briefing.nome_produto}</p>
        </div>

        {briefing.descricao_resumida && (
          <div>
            <label className="text-sm font-medium text-gray-600">Descrição Resumida</label>
            <p className="text-sm bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{briefing.descricao_resumida}</p>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Investimento Diário</label>
            <p className="text-sm bg-gray-50 p-2 rounded">{formatCurrency(briefing.investimento_diario)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Comissão Aceita</label>
            <p className="text-sm bg-gray-50 p-2 rounded">{briefing.comissao_aceita || 'Não informado'}</p>
          </div>
        </div>

        {briefing.observacoes_finais && (
          <div>
            <label className="text-sm font-medium text-gray-600">Observações Finais</label>
            <p className="text-sm bg-gray-50 p-3 rounded mt-1 whitespace-pre-wrap">{briefing.observacoes_finais}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm font-medium text-gray-600">Status de Edição</label>
            <div className="mt-1">
              <Badge variant={briefing.liberar_edicao ? "default" : "secondary"}>
                {briefing.liberar_edicao ? "Edição Liberada" : "Edição Bloqueada"}
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
          <h2 className="text-2xl font-bold">Formulários de Briefing</h2>
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
            placeholder="Buscar por email, produto ou descrição..."
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
                    <Badge variant={briefing.liberar_edicao ? "default" : "secondary"} className="text-xs">
                      {briefing.liberar_edicao ? "Editável" : "Bloqueado"}
                    </Badge>
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
                    <span className="font-medium text-gray-600">Comissão:</span>
                    <p className="text-gray-800">{briefing.comissao_aceita || 'Não informado'}</p>
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
