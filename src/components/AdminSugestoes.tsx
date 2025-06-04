
import { useState, useEffect } from 'react'
import { useSugestoesMelhorias } from '@/hooks/useSugestoesMelhorias'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lightbulb, MessageCircle, Clock, CheckCircle, User, Filter, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AdminSugestoes() {
  const { sugestoes, loading, fetchSugestoes, responderSugestao, marcarComoConcluida } = useSugestoesMelhorias()
  const { toast } = useToast()
  const [filtroStatus, setFiltroStatus] = useState('todas')
  const [respostaAberta, setRespostaAberta] = useState<string | null>(null)
  const [respostaTexto, setRespostaTexto] = useState('')
  const [enviandoResposta, setEnviandoResposta] = useState(false)
  const [marcandoConcluida, setMarcandoConcluida] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 [AdminSugestoes] Componente montado, buscando sugestões...')
    fetchSugestoes(true) // true = buscar todas as sugestões (modo admin)
  }, [])

  console.log('📊 [AdminSugestoes] Estado atual:')
  console.log('  - Loading:', loading)
  console.log('  - Total sugestões:', sugestoes.length)
  console.log('  - Sugestões:', sugestoes)

  const sugestoesFiltradas = sugestoes.filter(sugestao => {
    if (filtroStatus === 'todas') return true
    return sugestao.status === filtroStatus
  })

  const handleResponder = async (id: string) => {
    if (!respostaTexto.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, escreva uma resposta.",
        variant: "destructive"
      })
      return
    }

    setEnviandoResposta(true)
    const success = await responderSugestao(id, respostaTexto)
    
    if (success) {
      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi enviada ao gestor.",
        variant: "default"
      })
      setRespostaAberta(null)
      setRespostaTexto('')
      // Recarregar sugestões após responder
      fetchSugestoes(true)
    } else {
      toast({
        title: "Erro ao responder",
        description: "Não foi possível enviar a resposta. Tente novamente.",
        variant: "destructive"
      })
    }
    setEnviandoResposta(false)
  }

  const handleMarcarConcluida = async (id: string) => {
    setMarcandoConcluida(id)
    const success = await marcarComoConcluida(id)
    
    if (success) {
      toast({
        title: "Sugestão concluída!",
        description: "A sugestão foi marcada como concluída.",
        variant: "default"
      })
      // Recarregar sugestões após marcar como concluída
      fetchSugestoes(true)
    } else {
      toast({
        title: "Erro ao concluir",
        description: "Não foi possível marcar como concluída. Tente novamente.",
        variant: "destructive"
      })
    }
    setMarcandoConcluida(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'respondida': return 'bg-green-100 text-green-800'
      case 'concluida': return 'bg-blue-100 text-blue-800'
      case 'em_analise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-100 text-red-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'media': return 'bg-blue-100 text-blue-800'
      case 'baixa': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Sugestões dos Gestores</h1>
            <p className="text-gray-400">Gerencie e responda as sugestões de melhorias</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Filter className="h-4 w-4" />
            <span>Filtrar:</span>
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="respondida">Respondidas</SelectItem>
              <SelectItem value="concluida">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">{sugestoes.filter(s => s.status === 'pendente').length}</p>
                <p className="text-sm text-gray-400">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{sugestoes.filter(s => s.status === 'respondida').length}</p>
                <p className="text-sm text-gray-400">Respondidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{sugestoes.filter(s => s.status === 'concluida').length}</p>
                <p className="text-sm text-gray-400">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">{sugestoes.length}</p>
                <p className="text-sm text-gray-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Sugestões */}
      <div className="space-y-4">
        {sugestoesFiltradas.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {filtroStatus === 'todas' ? 'Nenhuma sugestão encontrada' : `Nenhuma sugestão ${filtroStatus} encontrada`}
              </p>
            </CardContent>
          </Card>
        ) : (
          sugestoesFiltradas.map((sugestao) => (
            <Card key={sugestao.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{sugestao.titulo}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="h-4 w-4" />
                        <span>{sugestao.gestor_nome}</span>
                      </div>
                      <Badge className={getStatusColor(sugestao.status)}>
                        {sugestao.status === 'pendente' && 'Pendente'}
                        {sugestao.status === 'respondida' && 'Respondida'}
                        {sugestao.status === 'concluida' && 'Concluída'}
                        {sugestao.status === 'em_analise' && 'Em Análise'}
                      </Badge>
                      <Badge className={getPrioridadeColor(sugestao.prioridade)}>
                        {sugestao.prioridade}
                      </Badge>
                      <span className="text-sm text-gray-500">{sugestao.categoria}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>Enviado em:</p>
                    <p>{new Date(sugestao.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{sugestao.descricao}</p>

                {sugestao.resposta_admin && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Sua Resposta:</span>
                    </div>
                    <p className="text-gray-300">{sugestao.resposta_admin}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Respondido em: {new Date(sugestao.respondido_em!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {sugestao.status === 'concluida' && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Concluída:</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Marcada como concluída em: {new Date(sugestao.concluido_em!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {/* Actions for pendente status */}
                {sugestao.status === 'pendente' && (
                  <div className="space-y-3">
                    {respostaAberta === sugestao.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={respostaTexto}
                          onChange={(e) => setRespostaTexto(e.target.value)}
                          placeholder="Escreva sua resposta..."
                          className="bg-gray-800 border-gray-700 text-white"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleResponder(sugestao.id)}
                            disabled={enviandoResposta}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {enviandoResposta ? 'Enviando...' : 'Enviar Resposta'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setRespostaAberta(null)
                              setRespostaTexto('')
                            }}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setRespostaAberta(sugestao.id)}
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Responder
                        </Button>
                        
                        <Button 
                          onClick={() => handleMarcarConcluida(sugestao.id)}
                          disabled={marcandoConcluida === sugestao.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {marcandoConcluida === sugestao.id ? (
                            <>Marcando...</>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Marcar como Concluída
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions for respondida status */}
                {sugestao.status === 'respondida' && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => handleMarcarConcluida(sugestao.id)}
                      disabled={marcandoConcluida === sugestao.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {marcandoConcluida === sugestao.id ? (
                        <>Marcando...</>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como Concluída
                        </>
                      )}
                    </Button>
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
