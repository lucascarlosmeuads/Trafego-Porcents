
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Clock, CheckCircle, DollarSign, Zap, Calendar } from 'lucide-react'
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
  const TICKET_MEDIO = 60
  
  // Calcular dados dos últimos 30 dias
  const hoje = new Date()
  const dataLimite = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  // Calcular dias restantes no mês
  const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
  const diaAtual = hoje.getDate()
  const diasRestantesNoMes = ultimoDiaDoMes - diaAtual + 1 // +1 para incluir o dia atual
  
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
  
  // NOVO: META DINÂMICA - Se atingiu 10K, meta vira 50K
  const META_INICIAL = 10000
  const META_AVANCADA = 50000
  const META_MENSAL = totalJaRecebido >= META_INICIAL ? META_AVANCADA : META_INICIAL
  
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
  
  // NOVO: Calcular vendas diárias necessárias
  const vendasDiariasNecessarias = diasRestantesNoMes > 0 
    ? Math.ceil(faltaParaMeta / TICKET_MEDIO / diasRestantesNoMes)
    : 0
  
  // Sistema de níveis baseado no progresso REAL
  const getNivel = (progresso: number, metaAtual: number) => {
    if (metaAtual === META_AVANCADA && progresso >= 100) return { nivel: 'Master Elite', emoji: '👑', cor: 'text-yellow-400', desc: 'Meta 50K conquistada!' }
    if (metaAtual === META_AVANCADA && progresso >= 75) return { nivel: 'Expert Pro+', emoji: '🔥', cor: 'text-orange-400', desc: 'Rumo aos 50K!' }
    if (metaAtual === META_AVANCADA && progresso >= 50) return { nivel: 'Expert Pro', emoji: '💎', cor: 'text-blue-400', desc: 'Metade dos 50K!' }
    if (metaAtual === META_AVANCADA && progresso >= 25) return { nivel: 'Expert', emoji: '⚡', cor: 'text-purple-400', desc: '1/4 dos 50K' }
    if (metaAtual === META_AVANCADA) return { nivel: 'Expert Iniciante', emoji: '🚀', cor: 'text-green-400', desc: 'Desafio 50K!' }
    
    // Níveis para meta de 10K
    if (progresso >= 100) return { nivel: 'Expert', emoji: '👑', cor: 'text-yellow-400', desc: 'Meta batida!' }
    if (progresso >= 75) return { nivel: 'Avançado', emoji: '🚀', cor: 'text-blue-400', desc: 'Quase lá!' }
    if (progresso >= 50) return { nivel: 'Progredindo', emoji: '⭐', cor: 'text-purple-400', desc: 'Na metade!' }
    if (progresso >= 25) return { nivel: 'Crescendo', emoji: '📈', cor: 'text-green-400', desc: '1/4 da meta' }
    return { nivel: 'Iniciante', emoji: '🎯', cor: 'text-gray-400', desc: 'Começando' }
  }

  const nivelAtual = getNivel(progressoMeta, META_MENSAL)

  // Mensagem motivacional CLARA e OBJETIVA
  const getMensagemMotivacional = () => {
    if (progressoMeta >= 100 && META_MENSAL === META_AVANCADA) return `🏆 INCRÍVEL! Meta de ${formatCurrency(META_MENSAL)} conquistada!`
    if (progressoMeta >= 100 && META_MENSAL === META_INICIAL) return `🎉 Parabéns! Meta batida com ${formatCurrency(totalJaRecebido)}! NOVA META: R$ 50.000!`
    if (META_MENSAL === META_AVANCADA && progressoMeta >= 75) return `🔥 Faltam apenas ${formatCurrency(faltaParaMeta)} para os 50K!`
    if (META_MENSAL === META_AVANCADA && progressoMeta >= 50) return `💎 Metade dos 50K! ${vendasDiariasNecessarias} vendas por dia para a meta.`
    if (META_MENSAL === META_AVANCADA && progressoMeta >= 25) return `⚡ Desafio 50K em andamento! ${vendasDiariasNecessarias} vendas diárias.`
    if (META_MENSAL === META_AVANCADA) return `🚀 Desafio 50K iniciado! ${vendasDiariasNecessarias} vendas por dia.`
    if (progressoMeta >= 75) return `🔥 Faltam apenas ${formatCurrency(faltaParaMeta)} para bater a meta!`
    if (progressoMeta >= 50) return `💪 Metade do caminho! ${vendasDiariasNecessarias} vendas por dia para a meta.`
    if (progressoMeta >= 25) return `📈 Bom progresso! ${vendasDiariasNecessarias} vendas diárias para R$ 10K.`
    if (totalJaRecebido > 0) return `🎯 Primeira conquista! Continue com ${vendasDiariasNecessarias} vendas por dia.`
    return `🚀 Comece sua jornada! ${vendasDiariasNecessarias} vendas por dia para a meta.`
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
    progressoMeta: progressoMeta.toFixed(1),
    diasRestantesNoMes,
    vendasDiariasNecessarias,
    META_MENSAL,
    isMetaAvancada: META_MENSAL === META_AVANCADA
  })

  return (
    <div className="space-y-6 p-6 bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* SEÇÃO HERO - PROGRESSO DA META */}
        <Card className="border-gray-800 shadow-2xl bg-gray-900 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${META_MENSAL === META_AVANCADA ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-full flex items-center justify-center border-2 border-gray-700 shadow-xl`}>
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Meta {META_MENSAL === META_AVANCADA ? 'AVANÇADA' : 'Mensal'}
                  </h1>
                  <p className="text-xl text-gray-300">{formatCurrency(META_MENSAL)}</p>
                  {META_MENSAL === META_AVANCADA && (
                    <p className="text-sm text-orange-400 font-medium">🔥 Desafio Elite Ativado!</p>
                  )}
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
                  <div className={`text-3xl font-bold ${META_MENSAL === META_AVANCADA ? 'text-orange-400' : 'text-blue-400'}`}>{progressoMeta.toFixed(0)}%</div>
                  <div className="text-sm text-gray-400">{nivelAtual.desc}</div>
                </div>
              </div>
              
              <SimpleProgress value={progressoMeta} className="h-4" />
              
              <div className={`text-center p-4 ${META_MENSAL === META_AVANCADA ? 'bg-orange-900/20 border-orange-500/20' : 'bg-gray-800'} rounded-lg border ${META_MENSAL === META_AVANCADA ? '' : 'border-gray-700'}`}>
                <p className="text-xl text-gray-200 font-medium">{getMensagemMotivacional()}</p>
                {!isFirstTime && diasRestantesNoMes > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {progressoMeta >= 100 ? (META_MENSAL === META_AVANCADA ? 'Meta Elite atingida!' : 'Meta atingida! Nova meta desbloqueada!') : `${diasRestantesNoMes} dias restantes no mês`}
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
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                📅 Vendas Diárias Necessárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {progressoMeta >= 100 ? '0' : vendasDiariasNecessarias}
              </div>
              <p className="text-gray-400">
                {progressoMeta >= 100 ? 'Meta já atingida!' : `vendas por dia para bater ${formatCurrency(META_MENSAL)}`}
              </p>
              {diasRestantesNoMes <= 0 && progressoMeta < 100 && (
                <p className="text-xs text-red-400 mt-2">
                  ⚠️ Último dia do mês! Acelere as vendas!
                </p>
              )}
              {diasRestantesNoMes > 0 && progressoMeta < 100 && (
                <p className="text-xs text-gray-400 mt-2">
                  {diasRestantesNoMes} dias restantes no mês
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
            {progressoMeta >= 100 && META_MENSAL === META_AVANCADA ? (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="text-xl font-semibold text-yellow-300 mb-2">👑 ELITE MASTER CONQUISTADO!</h3>
                <p className="text-yellow-400">
                  INCRÍVEL! Você bateu a meta de {formatCurrency(META_AVANCADA)}! Você é oficialmente um Master Elite!
                </p>
              </div>
            ) : progressoMeta >= 100 && META_MENSAL === META_INICIAL ? (
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-6 border border-orange-500/20">
                <h3 className="text-xl font-semibold text-orange-300 mb-2">🔥 NOVA META DESBLOQUEADA!</h3>
                <p className="text-orange-400 mb-3">
                  Parabéns! Você bateu os {formatCurrency(META_INICIAL)}! Agora o desafio é ainda maior: {formatCurrency(META_AVANCADA)}!
                </p>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Nova Meta:</span> R$ 50.000<br/>
                    <span className="font-medium">Nível:</span> Desafio Elite<br/>
                    <span className="font-medium">Recompensa:</span> Status Master Elite
                  </p>
                </div>
              </div>
            ) : isFirstTime ? (
              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold text-blue-300 mb-2">🚀 Comece Sua Jornada!</h3>
                <p className="text-blue-400 mb-3">
                  Bem-vindo! Vamos começar ativando suas primeiras campanhas.
                </p>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Meta:</span> {vendasDiariasNecessarias} vendas por dia<br/>
                    <span className="font-medium">Resultado:</span> {formatCurrency(META_MENSAL)} em comissões
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${META_MENSAL === META_AVANCADA ? 'bg-orange-500/10 border-orange-500/20' : 'bg-purple-500/10 border-purple-500/20'} rounded-lg p-6 border`}>
                <h3 className={`text-xl font-semibold ${META_MENSAL === META_AVANCADA ? 'text-orange-300' : 'text-purple-300'} mb-2`}>
                  {META_MENSAL === META_AVANCADA ? '🔥 DESAFIO ELITE!' : vendasDiariasNecessarias <= 2 ? '🔥 Reta Final!' : '💪 Continue Crescendo!'}
                </h3>
                <p className={`${META_MENSAL === META_AVANCADA ? 'text-orange-400' : 'text-purple-400'} mb-3`}>
                  {META_MENSAL === META_AVANCADA 
                    ? `Desafio de R$ 50K em andamento! ${vendasDiariasNecessarias} vendas por dia para fazer história!`
                    : vendasDiariasNecessarias <= 2 
                      ? `Você está quase lá! Apenas ${vendasDiariasNecessarias} vendas por dia para bater os R$ 10.000!`
                      : `Foque em ${vendasDiariasNecessarias} vendas por dia para acelerar rumo à meta.`
                  }
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="font-medium text-blue-300">Ritmo Atual</div>
                    <div className="text-sm text-blue-400">
                      {campanhasAtivas} campanhas ativas
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
                <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
                  <span className="text-gray-400">Conquistas:</span>
                  {META_MENSAL === META_INICIAL && progressoMeta >= 25 && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      🥉 25% Meta
                    </Badge>
                  )}
                  {META_MENSAL === META_INICIAL && progressoMeta >= 50 && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      🥈 50% Meta
                    </Badge>
                  )}
                  {META_MENSAL === META_INICIAL && progressoMeta >= 75 && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      🥇 75% Meta
                    </Badge>
                  )}
                  {META_MENSAL === META_INICIAL && progressoMeta >= 100 && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      🏆 Meta 10K Conquistada!
                    </Badge>
                  )}
                  {META_MENSAL === META_AVANCADA && totalJaRecebido >= META_INICIAL && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      🔥 Desafio Elite Ativo
                    </Badge>
                  )}
                  {META_MENSAL === META_AVANCADA && progressoMeta >= 25 && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      ⚡ 25% dos 50K
                    </Badge>
                  )}
                  {META_MENSAL === META_AVANCADA && progressoMeta >= 50 && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      💎 50% dos 50K
                    </Badge>
                  )}
                  {META_MENSAL === META_AVANCADA && progressoMeta >= 75 && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      🔥 75% dos 50K
                    </Badge>
                  )}
                  {META_MENSAL === META_AVANCADA && progressoMeta >= 100 && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30">
                      👑 MASTER ELITE!
                    </Badge>
                  )}
                </div>
                
                {/* Bônus Especial Atualizado */}
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">🏆</span>
                    </div>
                    <div>
                      <div className="font-medium text-yellow-300">
                        {META_MENSAL === META_AVANCADA ? 'Bônus Master Elite R$ 50K' : 'Bônus Especial R$ 10K'}
                      </div>
                      <p className="text-xs text-yellow-200/80 mt-1">
                        {META_MENSAL === META_AVANCADA 
                          ? 'Batendo a meta elite de 50K, você receberá o maior bônus da história da empresa!'
                          : 'Batendo a meta dos 10K em 30 dias, você receberá um bônus especial que ainda estamos organizando!'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
