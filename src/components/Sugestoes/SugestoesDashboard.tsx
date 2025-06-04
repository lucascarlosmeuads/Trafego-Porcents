
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Lightbulb, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { useSugestoesMelhorias } from '@/hooks/useSugestoesMelhorias'
import { useAuth } from '@/hooks/useAuth'
import { SugestaoForm } from './SugestaoForm'
import { SugestaoCard } from './SugestaoCard'
import { LoadingFallback } from '@/components/LoadingFallback'

export function SugestoesDashboard() {
  const { user } = useAuth()
  const { sugestoes, loading, criarSugestao, atualizarSugestao } = useSugestoesMelhorias(user?.email || '')
  const [showForm, setShowForm] = useState(false)

  if (loading) {
    return <LoadingFallback />
  }

  const sugestoesPendentes = sugestoes.filter(s => s.status === 'pendente')
  const sugestoesEmAnalise = sugestoes.filter(s => s.status === 'em_analise')
  const sugestoesRespondidas = sugestoes.filter(s => ['aprovada', 'rejeitada', 'implementada'].includes(s.status))

  const getStatusIcon = (count: number, type: string) => {
    switch (type) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'analise':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'respondidas':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            Sugestões de Melhorias
          </h1>
          <p className="text-gray-600 mt-2">
            Compartilhe suas ideias para melhorar o sistema
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sugestões</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sugestoes.length}</div>
            <CardDescription>Todas as suas sugestões</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            {getStatusIcon(sugestoesPendentes.length, 'pendente')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sugestoesPendentes.length}</div>
            <CardDescription>Aguardando análise</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            {getStatusIcon(sugestoesEmAnalise.length, 'analise')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sugestoesEmAnalise.length}</div>
            <CardDescription>Sendo avaliadas</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respondidas</CardTitle>
            {getStatusIcon(sugestoesRespondidas.length, 'respondidas')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sugestoesRespondidas.length}</div>
            <CardDescription>Com feedback do admin</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Abas das Sugestões */}
      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">
            Todas ({sugestoes.length})
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes ({sugestoesPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="analise">
            Em Análise ({sugestoesEmAnalise.length})
          </TabsTrigger>
          <TabsTrigger value="respondidas">
            Respondidas ({sugestoesRespondidas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {sugestoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lightbulb className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma sugestão ainda
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  Você ainda não enviou nenhuma sugestão. Que tal compartilhar uma ideia para melhorar o sistema?
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Criar primeira sugestão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sugestoes.map((sugestao) => (
                <SugestaoCard 
                  key={sugestao.id} 
                  sugestao={sugestao}
                  onUpdate={atualizarSugestao}
                  showGestorInfo={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesPendentes.map((sugestao) => (
              <SugestaoCard 
                key={sugestao.id} 
                sugestao={sugestao}
                onUpdate={atualizarSugestao}
                showGestorInfo={false}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analise" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesEmAnalise.map((sugestao) => (
              <SugestaoCard 
                key={sugestao.id} 
                sugestao={sugestao}
                onUpdate={atualizarSugestao}
                showGestorInfo={false}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="respondidas" className="space-y-4">
          <div className="grid gap-4">
            {sugestoesRespondidas.map((sugestao) => (
              <SugestaoCard 
                key={sugestao.id} 
                sugestao={sugestao}
                onUpdate={atualizarSugestao}
                showGestorInfo={false}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal do Formulário */}
      {showForm && (
        <SugestaoForm
          onClose={() => setShowForm(false)}
          onSubmit={criarSugestao}
          gestorEmail={user?.email || ''}
          gestorNome={user?.user_metadata?.full_name || user?.email || ''}
        />
      )}
    </div>
  )
}
