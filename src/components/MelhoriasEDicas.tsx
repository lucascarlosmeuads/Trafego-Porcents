
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, TrendingUp, Zap, Target, Clock, Users, BarChart3, Lightbulb } from 'lucide-react'

export function MelhoriasEDicas() {
  const [melhoriasExpanded, setMelhoriasExpanded] = useState(false)
  const [dicasExpanded, setDicasExpanded] = useState(false)

  return (
    <div className="space-y-6 p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 shadow-lg">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Melhorias & Dicas</h1>
        </div>
        <p className="text-muted-foreground">Descubra as últimas melhorias e dicas para otimizar sua produtividade</p>
      </div>

      {/* Banner Melhorias Recentes */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-2 shadow-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg text-green-700 dark:text-green-300">
                🚀 Melhorias Recentes
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMelhoriasExpanded(!melhoriasExpanded)}
              className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
            >
              {melhoriasExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {melhoriasExpanded && (
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-green-200/50">
              <div className="bg-green-500 rounded-full p-1.5 mt-0.5">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Performance Otimizada</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Carregamento da tabela 40% mais rápido com paginação inteligente.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-green-200/50">
              <div className="bg-green-500 rounded-full p-1.5 mt-0.5">
                <Target className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Filtros Avançados</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Novos filtros para status de site, criativo e BM para melhor organização.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-green-200/50">
              <div className="bg-green-500 rounded-full p-1.5 mt-0.5">
                <Users className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Chat Melhorado</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Sistema de mensagens com áudio e indicadores de status em tempo real.</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Banner Dicas de Produtividade */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 shadow-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                💡 Dicas de Produtividade
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDicasExpanded(!dicasExpanded)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
            >
              {dicasExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {dicasExpanded && (
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-blue-200/50">
              <div className="bg-blue-500 rounded-full p-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Atalhos de Teclado</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Use Ctrl+F para buscar rapidamente na tabela. Ctrl+K para abrir comandos rápidos.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-blue-200/50">
              <div className="bg-blue-500 rounded-full p-1.5 mt-0.5">
                <Target className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Filtros Combinados</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Combine múltiplos filtros para encontrar exatamente os clientes que você precisa.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-blue-200/50">
              <div className="bg-blue-500 rounded-full p-1.5 mt-0.5">
                <BarChart3 className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Dashboard Personalizado</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Configure seu dashboard para ver as métricas mais importantes primeiro.</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
