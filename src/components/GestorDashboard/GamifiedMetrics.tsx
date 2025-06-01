
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Calendar, Trophy, Zap, Rocket, Star, Crown } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface GamifiedMetricsProps {
  clientes: Cliente[]
}

// Componente Progress motivacional com cores escuras e destaques roxos
const MotivationalProgress = ({ value, className }: { value: number; className?: string }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-purple-500 to-violet-600'
    if (progress >= 50) return 'bg-gradient-to-r from-purple-600 to-purple-700'
    if (progress >= 25) return 'bg-gradient-to-r from-purple-700 to-purple-800'
    return 'bg-gradient-to-r from-purple-800 to-purple-900'
  }
  
  return (
    <div className={`w-full bg-gray-800 rounded-full h-4 ${className}`}>
      <div 
        className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(value)}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
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
  
  // Clientes pagos nos últimos 30 dias
  const clientesPagosRecentes = clientes.filter(cliente => {
    if (cliente.comissao !== 'Pago') return false
    const dataCliente = new Date(cliente.created_at)
    return dataCliente >= dataLimite
  })
  
  const totalRecebido30Dias = clientesPagosRecentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60), 0
  )
  
  // Total pendente
  const clientesPendentes = clientes.filter(cliente => 
    cliente.comissao !== 'Pago'
  )
  const totalPendente = clientesPendentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60), 0
  )
  
  // Campanhas ativas
  const clientesAtivos = clientes.filter(cliente => 
    cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
  )
  const campanhasAtivas = clientesAtivos.length
  
  // Problemas em aberto
  const problemasAbertos = clientes.filter(cliente => 
    cliente.status_campanha === 'Problema'
  ).length
  
  // CÁLCULOS MOTIVACIONAIS BASEADOS NA META DE 10K
  const progressoMeta = Math.min(100, (totalRecebido30Dias / META_MENSAL) * 100)
  const faltaParaMeta = Math.max(0, META_MENSAL - totalRecebido30Dias)
  
  // Calcular quantas campanhas faltam para a meta
  const campanhasParaMeta = Math.ceil(faltaParaMeta / TICKET_MEDIO)
  
  // Dias restantes no mês
  const diasRestantesMes = Math.max(1, Math.ceil((new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)))
  const metaDiaria = faltaParaMeta / diasRestantesMes
  
  // Cálculo de vendas necessárias por dia
  const vendasPorDia = Math.ceil(metaDiaria / TICKET_MEDIO)
  
  // Sistema de conquistas motivacionais
  const conquistas = []
  
  if (progressoMeta >= 80) {
    conquistas.push({ icon: '👑', texto: 'Quase lá! Meta 10K quase batida!', cor: 'bg-blue-900/20 text-blue-400 border-blue-500/30' })
  } else if (progressoMeta >= 50) {
    conquistas.push({ icon: '🚀', texto: 'Metade do caminho conquistada!', cor: 'bg-blue-900/20 text-blue-400 border-blue-500/30' })
  } else if (progressoMeta >= 25) {
    conquistas.push({ icon: '⭐', texto: '25% da meta alcançada!', cor: 'bg-blue-900/20 text-blue-400 border-blue-500/30' })
  }
  
  if (campanhasAtivas >= 10) {
    conquistas.push({ icon: '🔥', texto: `${campanhasAtivas} campanhas no ar — cada uma pode render até R$60!`, cor: 'bg-blue-900/20 text-blue-400 border-blue-500/30' })
  } else if (campanhasAtivas >= 5) {
    conquistas.push({ icon: '💪', texto: `${campanhasAtivas} campanhas no ar — cada uma pode render até R$60!`, cor: 'bg-blue-900/20 text-blue-400 border-blue-500/30' })
  } else if (campanhasAtivas > 0) {
    conquistas.push({ icon: '🎯', texto: `${campanhasAtivas} campanhas no ar — cada uma pode render até R$60!`, cor: 'bg-blue-900/20 text-blue-400 border-blue-500/30' })
  }
  
  if (totalRecebido30Dias > 0) {
    conquistas.push({ icon: '💰', texto: 'Faturamento ativo este mês!', cor: 'bg-green-900/20 text-green-400 border-green-500/30' })
  }
  
  // Mensagens motivacionais dinâmicas
  const getMensagemMotivacional = () => {
    if (progressoMeta >= 80) {
      return `🏆 Incrível! Você já conquistou ${progressoMeta.toFixed(1)}% da sua meta de 10K! A reta final chegou!`
    }
    if (progressoMeta >= 50) {
      return `🚀 Fantástico! Você já passou da metade da meta! Faltam apenas ${formatCurrency(faltaParaMeta)} para os 10K!`
    }
    if (progressoMeta >= 25) {
      return `⭐ Ótimo progresso! Você já conquistou ${formatCurrency(totalRecebido30Dias)} rumo aos 10K!`
    }
    if (campanhasAtivas > 0) {
      return `💪 ${campanhasAtivas} campanhas no ar — cada uma pode render até R$60! Vamos acelerar?`
    }
    return `🎯 Sua meta de 10K está esperando! Com ${campanhasParaMeta} campanhas ativas, você chega lá!`
  }

  return (
    <div className="space-y-6 bg-gray-950 min-h-screen p-6">
      {/* Mensagem Motivacional Principal */}
      <Card className="bg-gray-900/80 border-gray-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-orange-400" />
            <div>
              <p className="text-xl font-bold mb-2 text-white">{getMensagemMotivacional()}</p>
              <div className="flex items-center space-x-4 text-gray-300">
                <span>Meta: <span className="text-green-400 font-semibold">{formatCurrency(META_MENSAL)}</span></span>
                <span>•</span>
                <span>Conquistado: <span className="text-green-400 font-semibold">{formatCurrency(totalRecebido30Dias)}</span></span>
                <span>•</span>
                <span>Faltam: <span className="text-orange-400 font-semibold">{formatCurrency(faltaParaMeta)}</span></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso da Meta de 10K */}
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl text-white">
            <Target className="h-6 w-6 mr-3 text-purple-400" />
            Progresso da Meta: R$ 10.000,00
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-400">{formatCurrency(totalRecebido30Dias)}</span>
            <span className="text-lg font-semibold text-purple-400">{progressoMeta.toFixed(1)}%</span>
          </div>
          <MotivationalProgress value={progressoMeta} className="h-4" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="font-bold text-orange-400">Faltam</div>
              <div className="text-lg text-orange-300">{formatCurrency(faltaParaMeta)}</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="font-bold text-purple-400">Campanhas necessárias</div>
              <div className="text-lg text-purple-300">{campanhasParaMeta}</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="font-bold text-blue-400">Vendas por dia</div>
              <div className="text-lg text-blue-300">{vendasPorDia}</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400">
            Você precisa de <span className="text-orange-400 font-semibold">{vendasPorDia} vendas por dia</span> para bater essa meta
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance Motivacionais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400 flex items-center">
              <Rocket className="h-4 w-4 mr-2" />
              Campanhas no Ar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-300">{campanhasAtivas}</div>
            <p className="text-xs text-blue-400 mt-1">
              cada uma pode render até R$60! 🚀
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Já Conquistado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">{formatCurrency(totalRecebido30Dias)}</div>
            <p className="text-xs text-green-400 mt-1">
              dos seus 10K! 💰
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Falta Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-green-400 mt-1">
              aguardando novas campanhas no ar ⭐
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-400 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Meta Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">{formatCurrency(metaDiaria)}</div>
            <p className="text-xs text-orange-400 mt-1">
              para chegar nos 10K ⚡
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas e Medalhas */}
      {conquistas.length > 0 && (
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg text-white">
              <Trophy className="h-5 w-5 mr-2 text-blue-400" />
              Suas Conquistas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {conquistas.map((conquista, index) => (
                <Badge key={index} className={`${conquista.cor} border px-4 py-2 text-sm font-medium`}>
                  <span className="mr-2 text-lg">{conquista.icon}</span>
                  {conquista.texto}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Potencial de Crescimento */}
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg text-white">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Potencial de Crescimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-purple-400">Com +5 campanhas</span>
                <span className="text-2xl">🚀</span>
              </div>
              <div className="text-xl font-bold text-purple-300">{formatCurrency(totalRecebido30Dias + (5 * TICKET_MEDIO))}</div>
              <div className="text-sm text-purple-400">
                {(totalRecebido30Dias + (5 * TICKET_MEDIO)) >= META_MENSAL ? '✅ Meta batida!' : `Faltariam ${formatCurrency(META_MENSAL - (totalRecebido30Dias + (5 * TICKET_MEDIO)))}`}
              </div>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-purple-400">Com +10 campanhas</span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-xl font-bold text-purple-300">{formatCurrency(totalRecebido30Dias + (10 * TICKET_MEDIO))}</div>
              <div className="text-sm text-purple-400">
                {(totalRecebido30Dias + (10 * TICKET_MEDIO)) >= META_MENSAL ? '🏆 Meta ultrapassada!' : `Faltariam ${formatCurrency(META_MENSAL - (totalRecebido30Dias + (10 * TICKET_MEDIO)))}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Suporte */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center bg-gray-900/80 border-gray-700">
          <CardContent className="p-4">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-blue-400">{campanhasAtivas}</div>
            <p className="text-sm text-blue-300">Campanhas no Ar</p>
            <p className="text-xs text-blue-400 mt-1">Cada uma pode render até R$60!</p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gray-900/80 border-gray-700">
          <CardContent className="p-4">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(totalPendente)}</div>
            <p className="text-sm text-green-300">Falta Receber</p>
            <p className="text-xs text-green-400 mt-1">{clientesPendentes.length} comissões aguardando</p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gray-900/80 border-gray-700">
          <CardContent className="p-4">
            <div className="text-3xl mb-2">{problemasAbertos > 0 ? '⚠️' : '✅'}</div>
            <div className="text-2xl font-bold text-orange-400">{problemasAbertos}</div>
            <p className="text-sm text-orange-300">Problemas</p>
            <p className="text-xs text-orange-400 mt-1">
              {problemasAbertos === 0 ? 'Tudo funcionando!' : 'Precisam de atenção'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action Final */}
      <Card className="bg-gray-900/80 border-orange-500/30 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-2 text-orange-400">🚀 Acelere!</h3>
          <p className="text-lg mb-4 text-white">
            Com {Math.min(10, campanhasParaMeta)} campanhas ativas hoje, você se aproxima dos 10K!
          </p>
          <div className="flex justify-center items-center space-x-6 text-gray-300">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{campanhasParaMeta}</div>
              <div className="text-sm">campanhas faltam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{formatCurrency(metaDiaria)}</div>
              <div className="text-sm">por dia restante</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{diasRestantesMes}</div>
              <div className="text-sm">dias restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
