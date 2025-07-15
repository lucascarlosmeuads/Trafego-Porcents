import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, DollarSign, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface OpenAIUsage {
  custo_mes: number
  custo_total: number
  limite_maximo: number
  disponivel: number
  tem_metodo_pagamento: boolean
  usando_fallback: boolean
  ultima_atualizacao: string
  status_api: string
  erro?: string
}

interface FormularioCount {
  total: number
  hoje: number
  esta_semana: number
  este_mes: number
}

export function OpenAICustosDashboard() {
  const [usage, setUsage] = useState<OpenAIUsage | null>(null)
  const [loading, setLoading] = useState(false)
  const [formularios, setFormularios] = useState<FormularioCount | null>(null)
  const { toast } = useToast()

  const fetchOpenAIUsage = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('openai-usage-monitor')
      
      if (error) {
        console.error('Erro ao buscar usage da OpenAI:', error)
        toast({
          title: "Erro",
          description: "Não foi possível buscar os dados de uso da OpenAI",
          variant: "destructive"
        })
        return
      }

      setUsage(data)
    } catch (error) {
      console.error('Erro na requisição:', error)
      toast({
        title: "Erro",
        description: "Erro de conexão ao buscar dados da OpenAI",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchFormulariosCount = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0]
      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

      // Total de formulários
      const { count: total } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact', head: true })

      // Formulários de hoje
      const { count: hojeCont } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoje)

      // Formulários desta semana
      const { count: semanaCont } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioSemana.toISOString())

      // Formulários deste mês
      const { count: mesCont } = await supabase
        .from('formularios_parceria')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioMes.toISOString())

      setFormularios({
        total: total || 0,
        hoje: hojeCont || 0,
        esta_semana: semanaCont || 0,
        este_mes: mesCont || 0
      })
    } catch (error) {
      console.error('Erro ao buscar contagem de formulários:', error)
    }
  }

  useEffect(() => {
    fetchFormulariosCount()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const getStatusColor = () => {
    if (!usage) return 'default'
    const percentUsed = (usage.custo_mes / usage.limite_maximo) * 100
    if (percentUsed > 80) return 'destructive'
    if (percentUsed > 60) return 'secondary'
    return 'default'
  }

  const getUsagePercentage = () => {
    if (!usage) return 0
    return Math.min((usage.custo_mes / usage.limite_maximo) * 100, 100)
  }

  const estimatedCostPerPlan = usage && formularios?.este_mes ? (usage.custo_mes / formularios.este_mes) : 0.025

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Custos OpenAI</h2>
          <p className="text-muted-foreground">
            Monitore seus gastos com IA
          </p>
        </div>
        <Button onClick={fetchOpenAIUsage} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status da API */}
      {usage?.status_api === 'erro' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao conectar com a API da OpenAI. Verifique se a chave está configurada corretamente.
          </AlertDescription>
        </Alert>
      )}

      {usage?.usando_fallback && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Usando dados estimados. Para dados precisos, verifique a configuração da API OpenAI.
          </AlertDescription>
        </Alert>
      )}

      {/* Card principal - Resumo financeiro */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(usage.custo_mes)}
                </div>
                <p className="text-sm text-muted-foreground">Gasto este mês</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(usage.disponivel)}
                </div>
                <p className="text-sm text-muted-foreground">Disponível para gastar</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado</span>
                  <span>{getUsagePercentage().toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getStatusColor() === 'destructive' ? 'bg-red-500' :
                      getStatusColor() === 'secondary' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Limite máximo:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(usage.limite_maximo)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Planejamentos (mês):</span>
                <span className="text-lg font-bold">
                  {formularios?.este_mes || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Custo médio/planejamento:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(estimatedCostPerPlan)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Método de pagamento:</span>
                <Badge variant={usage.tem_metodo_pagamento ? "default" : "destructive"}>
                  {usage.tem_metodo_pagamento ? "✓ Configurado" : "⚠ Não configurado"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status da API:</span>
                <Badge variant={usage.status_api === 'conectada' ? "default" : "secondary"}>
                  {usage.status_api === 'conectada' ? "Conectada" : "Limitada"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fallback quando não há dados da OpenAI */}
      {!usage && formularios && (
        <Card>
          <CardHeader>
            <CardTitle>Estimativa de Custos</CardTitle>
            <CardDescription>
              Baseado no uso de planejamentos estratégicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formularios.total}</div>
                <p className="text-xs text-muted-foreground">Total planejamentos</p>
                <p className="text-sm font-medium">{formatCurrency(formularios.total * 0.025)}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formularios.este_mes}</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
                <p className="text-sm font-medium">{formatCurrency(formularios.este_mes * 0.025)}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formularios.esta_semana}</div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
                <p className="text-sm font-medium">{formatCurrency(formularios.esta_semana * 0.025)}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formularios.hoje}</div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="text-sm font-medium">{formatCurrency(formularios.hoje * 0.025)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem inicial */}
      {!usage && !formularios && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Clique em "Atualizar" para carregar os dados de custos
            </p>
            <Button onClick={fetchOpenAIUsage} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Carregar Dados
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Links úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
          <CardDescription>
            Acesse diretamente o painel da OpenAI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a 
              href="https://platform.openai.com/usage" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Dashboard de Uso - OpenAI
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a 
              href="https://platform.openai.com/account/billing" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Configurações de Faturamento
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}