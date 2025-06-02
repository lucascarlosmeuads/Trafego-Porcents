
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Clock, CheckCircle, DollarSign, Zap } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface GamifiedMetricsProps {
  clientes: Cliente[]
}

// Simple Progress component for dark theme
const SimpleProgress = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-gray-800 rounded-full h-4 ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
    </div>
  )
}

export function GamifiedMetrics({ clientes }: GamifiedMetricsProps) {
  // META FIXA MOTIVACIONAL DE R$ 10.000,00
  const META_MENSAL = 10000
  const TICKET_MEDIO = 60
  
  // Calcular dados dos últimos 30 dias
  const hoje = new Date()
  const dataLimite = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  // CORREÇÃO: Clientes REALMENTE pagos (comissao = "Pago")
  const clientesPagos = clientes.filter(cliente => 
    cliente.comissao === 'Pago'
  )
  
  const clientesPagosRecentes = clientesPagos.filter(cliente => {
    const dataCliente = new Date(cliente.created_at)
    return dataCliente >= dataLimite
  })
  
  const totalJaRecebido = clientesPagosRecentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60), 0
  )
  
  // CORREÇÃO: TODOS os clientes que NÃO estão pagos são considerados pendentes
  const clientesPendentes = clientes.filter(cliente => 
    cliente.comissao !== 'Pago'
  )
  const totalPendentePagamento = clientesPendentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60), 0
  )
  
  // Campanhas realmente ativas (separado dos pendentes)
  const campanhasAtivas = clientes.filter(cliente => 
    cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
  ).length
  
  // CÁLCULOS PARA A META
  const progressoMeta = Math.min(100, (totalJaRecebido / META_MENSAL) * 100)
  const faltaParaMeta = Math.max(0, META_MENSAL - totalJaRecebido)
  const campanhasParaMeta = Math.ceil(faltaParaMeta / TICKET_MEDIO)
  
  // Sistema de níveis baseado no progresso REAL
  const getNivel = (progresso: number) => {
    if (progresso >= 100) return { nivel: 'Expert', emoji: '👑', cor: 'text-yellow-400', desc: 'Meta batida!' }
    if (progresso >= 75) return { nivel: 'Avançado', emoji: '🚀', cor: 'text-blue-400', desc: 'Quase lá!' }
    if (progresso >= 50) return { nivel: 'Progredindo', emoji: '⭐', cor: 'text-purple-400', desc: 'Na metade!' }
    if (progresso >= 25) return { nivel: 'Crescendo', emoji: '📈', cor: 'text-green-400', desc: '1/4 da meta' }
    return { nivel: 'Iniciante', emoji: '🎯', cor: 'text-gray-400', desc: 'Começando' }
  }

  const nivelAtual = getNivel(progressoMeta)

  // Mensagem motivacional CLARA e OBJETIVA
  const getMensagemMotivacional = () => {
    if (progressoMeta >= 100) return `🎉 Parabéns! Meta batida com ${formatCurrency(totalJaRecebido)}!`
    if (progressoMeta >= 75) return `🔥 Faltam apenas ${formatCurrency(faltaParaMeta)} para bater a meta!`
    if (progressoMeta >= 50) return `💪 Metade do caminho! ${campanhasParaMeta} campanhas para a meta.`
    if (progressoMeta >= 25) return `📈 Bom progresso! Ative ${campanhasParaMeta} campanhas para R$ 10K.`
    if (totalJaRecebido > 0) return `🎯 Primeira conquista! Continue ativando campanhas.`
    return `🚀 Comece sua jornada! Ative suas primeiras campanhas.`
  }

  // Detectar se é primeiro acesso ou dados vazios
  const isFirstTime = clientes.length === 0 || totalJaRecebido === 0

  console.log('📊 [GamifiedMetrics] Debug dos cálculos:', {
    totalClientes: clientes.length,
    clientesPagos: clientesPagos.length,
    clientesPendentes: clientesPendentes.length,
    totalJaRecebido,
    totalPendentePagamento,
    campanhasAtivas,
    progressoMeta: progressoMeta.toFixed(1)
  })

  return (
    <div className="space-y-6 p-6 bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* SEÇÃO HERO - PROGRESSO DA META */}
        <Card className="border-gray-800 shadow-2xl bg-gray-900 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Meta Mensal</h1>
                  <p className="text-xl text-gray-300">{formatCurrency(META_MENSAL)}</p>
                </div>
              </div>
              <Badge variant="secondary" className={`${nivelAtual.cor} bg-gray-800 border-gray-700 text-lg font-medium px-4 py-2`}>
                {nivelAtual.emoji} {nivelAtual.nivel}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-5xl font-bold text-white">{formatCurrency(totalJaRecebido)}</span>
                  <span className="text-xl text-gray-400 ml-3">de {formatCurrency(META_MENSAL)}</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">{progressoMeta.toFixed(0)}%</div>
                  <div className="text-sm text-gray-400">{nivelAtual.desc}</div>
                </div>
              </div>
              
              <SimpleProgress value={progressoMeta} className="h-4" />
              
              <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-xl text-gray-200 font-medium">{getMensagemMotivacional()}</p>
                {!isFirstTime && (
                  <p className="text-sm text-gray-400 mt-2">
                    {campanhasParaMeta > 0 ? `${campanhasParaMeta} campanhas restantes` : 'Meta atingida!'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO FINANCEIRA - LADO A LADO */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-gray-800 shadow-lg bg-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30 mr-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                💰 Já Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">{formatCurrency(totalJaRecebido)}</div>
              <p className="text-gray-400">
                {clientesPagos.length} comissões pagas nos últimos 30 dias
              </p>
              {isFirstTime && (
                <p className="text-xs text-gray-500 mt-2">
                  Suas primeiras comissões aparecerão aqui quando forem pagas
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-800 shadow-lg bg-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30 mr-3">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
                ⏱️ Pendente de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400 mb-2">{formatCurrency(totalPendentePagamento)}</div>
              <p className="text-gray-400">
                {clientesPendentes.length} comissões aguardando pagamento
              </p>
              {totalPendentePagamento === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Campanhas ativas aparecerão aqui quando estiverem prontas para pagamento
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SEÇÃO OPERACIONAL */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-gray-800 shadow-lg bg-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 mr-3">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                🚀 Campanhas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">{campanhasAtivas}</div>
              <p className="text-gray-400">
                Campanhas rodando no ar agora
              </p>
              {campanhasAtivas === 0 && (
                <p className="text-xs text-orange-400 mt-2">
                  ⚠️ Nenhuma campanha ativa no momento
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-800 shadow-lg bg-gray-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 mr-3">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                🎯 Para Atingir Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {progressoMeta >= 100 ? '0' : campanhasParaMeta}
              </div>
              <p className="text-gray-400">
                {progressoMeta >= 100 ? 'Meta já atingida!' : 'Campanhas necessárias para R$ 10K'}
              </p>
              {campanhasParaMeta > 10 && (
                <p className="text-xs text-yellow-400 mt-2">
                  💡 Foque em 5-10 campanhas por vez para melhor gestão
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CALL TO ACTION PRINCIPAL */}
        <Card className="border-gray-800 shadow-lg bg-gray-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Zap className="h-6 w-6 mr-3 text-yellow-400" />
              🎯 Próximo Passo para o Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressoMeta >= 100 ? (
              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                <h3 className="text-xl font-semibold text-green-300 mb-2">🎉 Meta Conquistada!</h3>
                <p className="text-green-400">
                  Parabéns! Você bateu a meta de {formatCurrency(META_MENSAL)} este mês. Continue o excelente trabalho!
                </p>
              </div>
            ) : isFirstTime ? (
              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold text-blue-300 mb-2">🚀 Comece Sua Jornada!</h3>
                <p className="text-blue-400 mb-3">
                  Bem-vindo! Vamos começar ativando suas primeiras campanhas.
                </p>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Meta:</span> Ativar 5-10 campanhas na primeira semana<br/>
                    <span className="font-medium">Resultado:</span> Até {formatCurrency(10 * TICKET_MEDIO)} em comissões
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-purple-300 mb-2">
                  {campanhasParaMeta <= 5 ? '🔥 Reta Final!' : '💪 Continue Crescendo!'}
                </h3>
                <p className="text-purple-400 mb-3">
                  {campanhasParaMeta <= 5 
                    ? `Você está quase lá! Apenas ${campanhasParaMeta} campanhas para bater os R$ 10.000!`
                    : `Ative mais ${Math.min(10, campanhasParaMeta)} campanhas para acelerar rumo à meta.`
                  }
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="font-medium text-blue-300">Potencial Atual</div>
                    <div className="text-sm text-blue-400">
                      {campanhasAtivas} campanhas = {formatCurrency(campanhasAtivas * TICKET_MEDIO)}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="font-medium text-green-300">Falta para Meta</div>
                    <div className="text-sm text-green-400">
                      {formatCurrency(faltaParaMeta)} restantes
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conquistas */}
            {progressoMeta > 0 && (
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-400">Conquistas:</span>
                  {progressoMeta >= 25 && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      🥉 25% Meta
                    </Badge>
                  )}
                  {progressoMeta >= 50 && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      🥈 50% Meta
                    </Badge>
                  )}
                  {progressoMeta >= 75 && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      🥇 75% Meta
                    </Badge>
                  )}
                  {progressoMeta >= 100 && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      👑 Meta Conquistada!
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
