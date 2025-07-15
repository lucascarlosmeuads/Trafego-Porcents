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
  total_usage: number
  hard_limit_usd: number
  soft_limit_usd: number
  has_payment_method: boolean
  custo_hoje: number
  custo_semana: number
  custo_mes: number
  total_tokens: number
  daily_costs: Array<{
    timestamp: string
    line_items: Array<{
      cost: number
      n_usage: number
      name: string
    }>
  }>
  plan: any
  access_until: string
  periodo_consultado: {
    inicio_mes: string
    inicio_semana: string
    hoje: string
  }
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
    const percentUsed = (usage.custo_mes / usage.hard_limit_usd) * 100
    if (percentUsed > 80) return 'destructive'
    if (percentUsed > 60) return 'secondary'
    return 'default'
  }

  const getUsagePercentage = () => {
    if (!usage) return 0
    return Math.min((usage.custo_mes / usage.hard_limit_usd) * 100, 100)
  }

  const estimatedCostPerPlan = usage ? (usage.custo_mes / Math.max(formularios?.este_mes || 1, 1)) : 0.025

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento OpenAI</h2>
          <p className="text-muted-foreground">
            Acompanhe custos e uso da API OpenAI
          </p>
        </div>
        <Button onClick={fetchOpenAIUsage} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards principais de custos OpenAI */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Custo Total (Mês)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(usage.custo_mes)}</div>
              <p className="text-xs text-muted-foreground">
                {formularios?.este_mes || 0} planejamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(usage.custo_hoje)}</div>
              <p className="text-xs text-muted-foreground">
                {formularios?.hoje || 0} planejamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(usage.custo_semana)}</div>
              <p className="text-xs text-muted-foreground">
                {formularios?.esta_semana || 0} planejamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(estimatedCostPerPlan)}</div>
              <p className="text-xs text-muted-foreground">
                Por planejamento
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cards de estatísticas de formulários */}
      {formularios && !usage && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Planejamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formularios.total}</div>
              <p className="text-xs text-muted-foreground">
                Custo estimado: {formatCurrency(formularios.total * 0.025)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formularios.hoje}</div>
              <p className="text-xs text-muted-foreground">
                Custo estimado: {formatCurrency(formularios.hoje * 0.025)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formularios.esta_semana}</div>
              <p className="text-xs text-muted-foreground">
                Custo estimado: {formatCurrency(formularios.esta_semana * 0.025)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formularios.este_mes}</div>
              <p className="text-xs text-muted-foreground">
                Custo estimado: {formatCurrency(formularios.este_mes * 0.025)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dados detalhados da OpenAI */}
      {usage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Saldo e Limites
              </CardTitle>
              <CardDescription>
                Uso atual vs limites definidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Usado (mês):</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(usage.custo_mes)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Limite máximo:</span>
                  <span className="text-lg">
                    {formatCurrency(usage.hard_limit_usd)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Disponível:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(usage.hard_limit_usd - usage.custo_mes)}
                  </span>
                </div>
                {usage.soft_limit_usd > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Limite suave:</span>
                    <span className="text-lg text-orange-600">
                      {formatCurrency(usage.soft_limit_usd)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">% Usado:</span>
                  <Badge variant={getStatusColor()}>
                    {getUsagePercentage().toFixed(1)}%
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      getStatusColor() === 'destructive' ? 'bg-red-500' :
                      getStatusColor() === 'secondary' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${getUsagePercentage()}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas de Uso
              </CardTitle>
              <CardDescription>
                Tokens e configurações da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total de tokens:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR').format(usage.total_tokens)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Método de pagamento:</span>
                <Badge variant={usage.has_payment_method ? "default" : "destructive"}>
                  {usage.has_payment_method ? "Configurado" : "Não configurado"}
                </Badge>
              </div>

              {!usage.has_payment_method && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Método de pagamento não configurado. Configure na OpenAI para evitar interrupções.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uso total histórico:</span>
                <span className="font-medium">
                  {formatCurrency(usage.total_usage)}
                </span>
              </div>

              {usage.access_until && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Acesso até:</span>
                  <span className="font-medium text-sm">
                    {new Date(usage.access_until).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Clique em "Atualizar Dados" para carregar informações da OpenAI
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