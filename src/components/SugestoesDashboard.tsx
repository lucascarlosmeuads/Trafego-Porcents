import { useState, useEffect } from 'react'
import { useSugestoesMelhorias } from '@/hooks/useSugestoesMelhorias'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Plus, Clock, CheckCircle, MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function SugestoesDashboard() {
  const { sugestoes, loading, submitting, criarSugestao, fetchSugestoes } = useSugestoesMelhorias()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    prioridade: 'media'
  })

  useEffect(() => {
    console.log('🔍 [SugestoesDashboard] Componente montado, buscando sugestões do gestor...')
    fetchSugestoes(false) // false = buscar apenas sugestões do gestor atual
  }, [])

  console.log('📊 [SugestoesDashboard] Estado atual:')
  console.log('  - Loading:', loading)
  console.log('  - Total sugestões:', sugestoes.length)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    const success = await criarSugestao(formData)
    
    if (success) {
      toast({
        title: "Sugestão enviada!",
        description: "Sua sugestão foi enviada com sucesso para análise.",
        variant: "default"
      })
      setFormData({ titulo: '', descricao: '', categoria: '', prioridade: 'media' })
      setShowForm(false)
      // Recarregar sugestões após criar
      fetchSugestoes(false)
    } else {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua sugestão. Tente novamente.",
        variant: "destructive"
      })
    }
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
            <h1 className="text-2xl font-bold text-white">Sugestões de Melhorias</h1>
            <p className="text-gray-400">Compartilhe suas ideias para melhorar o sistema</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Nova Sugestão de Melhoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Título *</label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título da sugestão"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Categoria *</label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interface">Interface/UX</SelectItem>
                    <SelectItem value="funcionalidade">Nova Funcionalidade</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="relatorio">Relatórios</SelectItem>
                    <SelectItem value="automacao">Automação</SelectItem>
                    <SelectItem value="integracao">Integração</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Prioridade</label>
                <Select value={formData.prioridade} onValueChange={(value) => setFormData({ ...formData, prioridade: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Descrição *</label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva sua sugestão detalhadamente..."
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Enviando...' : 'Enviar Sugestão'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Sugestões */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Suas Sugestões</h2>
        
        {sugestoes.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Você ainda não enviou nenhuma sugestão</p>
            </CardContent>
          </Card>
        ) : (
          sugestoes.map((sugestao) => (
            <Card key={sugestao.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{sugestao.titulo}</h3>
                  <Badge className={getStatusColor(sugestao.status)}>
                    {sugestao.status === 'pendente' && <Clock className="h-3 w-3 mr-1" />}
                    {sugestao.status === 'respondida' && <MessageCircle className="h-3 w-3 mr-1" />}
                    {sugestao.status === 'concluida' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {sugestao.status === 'pendente' ? 'Pendente' : 'Respondida'}
                  </Badge>
                </div>
                
                <p className="text-gray-300 mb-4">{sugestao.descricao}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>Categoria: {sugestao.categoria}</span>
                  <span>Prioridade: {sugestao.prioridade}</span>
                  <span>Enviado em: {new Date(sugestao.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                {sugestao.resposta_admin && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Resposta do Administrador:</span>
                    </div>
                    <p className="text-gray-300">{sugestao.resposta_admin}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Respondido em: {new Date(sugestao.respondido_em!).toLocaleDateString('pt-BR')}
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
