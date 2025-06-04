
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lightbulb, Clock, Eye, CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import { useSugestoesMelhorias } from '@/hooks/useSugestoesMelhorias'
import { SugestaoCard } from './SugestaoCard'
import { SugestaoDetailsModal } from './SugestaoDetailsModal'
import { LoadingFallback } from '@/components/LoadingFallback'
import type { SugestaoMelhoria } from '@/hooks/useSugestoesMelhorias'

export function AdminSugestoes() {
  const { sugestoes, loading, responderSugestao, atualizarSugestao } = useSugestoesMelhorias()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all')
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('all')
  const [selectedSugestao, setSelectedSugestao] = useState<SugestaoMelhoria | null>(null)

  if (loading) {
    return <LoadingFallback />
  }

  // Filtrar sugestões
  const filteredSugestoes = sugestoes.filter(sugestao => {
    const matchesSearch = searchTerm === '' || 
      sugestao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sugestao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sugestao.gestor_nome.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategoria = categoriaFilter === 'all' || sugestao.categoria === categoriaFilter
    const matchesPrioridade = prioridadeFilter === 'all' || sugestao.prioridade === prioridadeFilter
    
    return matchesSearch && matchesCategoria && matchesPrioridade
  })

  // Agrupar por status
  const sugestoesPendentes = filteredSugestoes.filter(s => s.status === 'pendente')
  const sugestoesEmAnalise = filteredSugestoes.filter(s => s.status === 'em_analise')
  const sugestoesAprovadas = filteredSugestoes.filter(s => s.status === 'aprovada')
  const sugestoesImplementadas = filteredSugestoes.filter(s => s.status === 'implementada')
  const sugestoesRejeitadas = filteredSugestoes.filter(s => s.status === 'rejeitada')

  // Estatísticas
  const totalSugestoes = sugestoes.length
  const pendentesAnalise = sugestoes.filter(s => s.status === 'pendente').length
  const emAnalise = sugestoes.filter(s => s.status === 'em_analise').length
  const implementadas = sugestoes.filter(s => s.status === 'implementada').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          Administração de Sugestões
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie todas as sugestões de melhorias enviadas pelos gestores
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sugestões</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSugestoes}</div>
            <CardDescription>Todas as sugestões recebidas</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendentesAnalise}</div>
            <CardDescription>Aguardando sua análise</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{emAnalise}</div>
            <CardDescription>Sendo avaliadas</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{implementadas}</div>
            <CardDescription>Sugestões já implementadas</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por título, descrição ou gestor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="interface">Interface</SelectItem>
                <SelectItem value="funcionalidade">Funcionalidade</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || categoriaFilter !== 'all' || prioridadeFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Filtros ativos - {filteredSugestoes.length} resultado(s)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abas das Sugestões */}
      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pendentes">
            Pendentes ({sugestoesPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="analise">
            Em Análise ({sugestoesEmAnalise.length})
          </TabsTrigger>
          <TabsTrigger value="aprovadas">
            Aprovadas ({sugestoesAprovadas.length})
          </TabsTrigger>
          <TabsTrigger value="implementadas">
            Implementadas ({sugestoesImplementadas.length})
          </TabsTrigger>
          <TabsTrigger value="rejeitadas">
            Rejeitadas ({sugestoesRejeitadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          {sugestoesPendentes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma sugestão pendente
                </h3>
                <p className="text-gray-500 text-center">
                  Todas as sugestões foram analisadas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sugestoesPendentes.map((sugestao) => (
                <div key={sugestao.id} onClick={() => setSelectedSugestao(sugestao)} className="cursor-pointer">
                  <SugestaoCard 
                    sugestao={sugestao}
                    showGestorInfo={true}
                    isAdmin={true}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analise" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesEmAnalise.map((sugestao) => (
              <div key={sugestao.id} onClick={() => setSelectedSugestao(sugestao)} className="cursor-pointer">
                <SugestaoCard 
                  sugestao={sugestao}
                  showGestorInfo={true}
                  isAdmin={true}
                />
              </div>
            ))}
          </div>
        </sContent>

        <TabsContent value="aprovadas" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesAprovadas.map((sugestao) => (
              <div key={sugestao.id} onClick={() => setSelectedSugestao(sugestao)} className="cursor-pointer">
                <SugestaoCard 
                  sugestao={sugestao}
                  showGestorInfo={true}
                  isAdmin={true}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="implementadas" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesImplementadas.map((sugestao) => (
              <div key={sugestao.id} onClick={() => setSelectedSugestao(sugestao)} className="cursor-pointer">
                <SugestaoCard 
                  sugestao={sugestao}
                  showGestorInfo={true}
                  isAdmin={true}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejeitadas" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesRejeitadas.map((sugestao) => (
              <div key={sugestao.id} onClick={() => setSelectedSugestao(sugestao)} className="cursor-pointer">
                <SugestaoCard 
                  sugestao={sugestao}
                  showGestorInfo={true}
                  isAdmin={true}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes */}
      {selectedSugestao && (
        <SugestaoDetailsModal
          sugestao={selectedSugestao}
          onClose={() => setSelectedSugestao(null)}
          onResponder={responderSugestao}
          onAtualizarStatus={atualizarSugestao}
        />
      )}
    </div>
  )
}
