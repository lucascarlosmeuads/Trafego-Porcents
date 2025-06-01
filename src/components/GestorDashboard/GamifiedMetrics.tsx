
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Calendar, Trophy, Zap, Rocket, Star, Crown } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface GamifiedMetricsProps {
  clientes: Cliente[]
}

// Componente Progress motivacional com cores dinâmicas
const MotivationalProgress = ({ value, className }: { value: number; className?: string }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-600'
    if (progress >= 50) return 'bg-gradient-to-r from-blue-500 to-purple-600'
    if (progress >= 25) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-purple-500 to-blue-600'
  }
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-4 ${className}`}>
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
  
  // Calcular quantas campanhas faltam para a meta (assumindo R$ 60 por campanha)
  const valorPorCampanha = 60
  const campanhasParaMeta = Math.ceil(faltaParaMeta / valorPorCampanha)
  
  // Potencial com mais campanhas
  const potencialCom5Campanhas = totalRecebido30Dias + (5 * valorPorCampanha)
  const potencialCom10Campanhas = totalRecebido30Dias + (10 * valorPorCampanha)
  
  // Dias restantes no mês
  const diasRestantesMes = Math.max(1, Math.ceil((new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)))
  const metaDiaria = faltaParaMeta / diasRestantesMes
  
  // Sistema de conquistas motivacionais
  const conquistas = []
  
  if (progressoMeta >= 80) {
    conquistas.push({ icon: '👑', texto: 'Quase lá! Meta 10K quase batida!', cor: 'bg-yellow-100 text-yellow-800' })
  } else if (progressoMeta >= 50) {
    conquistas.push({ icon: '🚀', texto: 'Metade do caminho conquistada!', cor: 'bg-purple-100 text-purple-800' })
  } else if (progressoMeta >= 25) {
    conquistas.push({ icon: '⭐', texto: '25% da meta alcançada!', cor: 'bg-blue-100 text-blue-800' })
  }
  
  if (campanhasAtivas >= 10) {
    conquistas.push({ icon: '🔥', texto: `${campanhasAtivas} campanhas ativas! Impressionante!`, cor: 'bg-orange-100 text-orange-800' })
  } else if (campanhasAtivas >= 5) {
    conquistas.push({ icon: '💪', texto: `${campanhasAtivas} campanhas no ar — grande passo!`, cor: 'bg-green-100 text-green-800' })
  } else if (campanhasAtivas > 0) {
    conquistas.push({ icon: '🎯', texto: `${campanhasAtivas} campanhas ativas — já é um começo!`, cor: 'bg-blue-100 text-blue-800' })
  }
  
  if (totalRecebido30Dias > 0) {
    conquistas.push({ icon: '💰', texto: 'Faturamento ativo este mês!', cor: 'bg-green-100 text-green-800' })
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
      return `💪 ${campanhasAtivas} campanhas trabalhando para você! Cada uma pode render até R$ 60. Vamos acelerar?`
    }
    return `🎯 Sua meta de 10K está esperando! Com ${campanhasParaMeta} campanhas ativas, você chega lá!`
  }

  return (
    <div className="space-y-6">
      {/* Mensagem Motivacional Principal */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-700 border-none text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-yellow-300" />
            <div>
              <p className="text-xl font-bold mb-2">{getMensagemMotivacional()}</p>
              <div className="flex items-center space-x-4 text-purple-100">
                <span>Meta: {formatCurrency(META_MENSAL)}</span>
                <span>•</span>
                <span>Conquistado: {formatCurrency(totalRecebido30Dias)}</span>
                <span>•</span>
                <span>Faltam: {formatCurrency(faltaParaMeta)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso da Meta de 10K */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl text-green-800">
            <Target className="h-6 w-6 mr-3 text-emerald-600" />
            Progresso da Meta: R$ 10.000,00
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-800">{formatCurrency(totalRecebido30Dias)}</span>
            <span className="text-lg font-semibold text-emerald-700">{progressoMeta.toFixed(1)}%</span>
          </div>
          <MotivationalProgress value={progressoMeta} className="h-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="font-bold text-emerald-800">Faltam</div>
              <div className="text-lg text-emerald-600">{formatCurrency(faltaParaMeta)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-emerald-200">
              <div className="font-bold text-emerald-800">Campanhas necessárias</div>
              <div className="text-lg text-emerald-600">{campanhasParaMeta}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance Motivacionais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 flex items-center">
              <Rocket className="h-4 w-4 mr-2" />
              Campanhas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{campanhasAtivas}</div>
            <p className="text-xs text-blue-600 mt-1">
              trabalhando para você! 🚀
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Já Conquistado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(totalRecebido30Dias)}</div>
            <p className="text-xs text-green-600 mt-1">
              dos seus 10K! 💰
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Potencial Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-purple-600 mt-1">
              aguardando liberação ⭐
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Meta Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{formatCurrency(metaDiaria)}</div>
            <p className="text-xs text-orange-600 mt-1">
              para chegar nos 10K ⚡
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas e Medalhas */}
      {conquistas.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg text-yellow-800">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Suas Conquistas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {conquistas.map((conquista, index) => (
                <Badge key={index} className={`${conquista.cor} border-0 px-4 py-2 text-sm font-medium`}>
                  <span className="mr-2 text-lg">{conquista.icon}</span>
                  {conquista.texto}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Potencial de Crescimento */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg text-indigo-800">
            <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
            Potencial de Crescimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-indigo-800">Com +5 campanhas</span>
                <span className="text-2xl">🚀</span>
              </div>
              <div className="text-xl font-bold text-indigo-700">{formatCurrency(potencialCom5Campanhas)}</div>
              <div className="text-sm text-indigo-600">
                {potencialCom5Campanhas >= META_MENSAL ? '✅ Meta batida!' : `Faltariam ${formatCurrency(META_MENSAL - potencialCom5Campanhas)}`}
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-indigo-800">Com +10 campanhas</span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-xl font-bold text-indigo-700">{formatCurrency(potencialCom10Campanhas)}</div>
              <div className="text-sm text-indigo-600">
                {potencialCom10Campanhas >= META_MENSAL ? '🏆 Meta ultrapassada!' : `Faltariam ${formatCurrency(META_MENSAL - potencialCom10Campanhas)}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Suporte */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-green-700">{campanhasAtivas}</div>
            <p className="text-sm text-green-600">Campanhas Ativas</p>
            <p className="text-xs text-green-500 mt-1">Cada uma vale até R$ 60!</p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalPendente)}</div>
            <p className="text-sm text-blue-600">Valor Pendente</p>
            <p className="text-xs text-blue-500 mt-1">{clientesPendentes.length} comissões a receber</p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4">
            <div className="text-3xl mb-2">{problemasAbertos > 0 ? '⚠️' : '✅'}</div>
            <div className="text-2xl font-bold text-amber-700">{problemasAbertos}</div>
            <p className="text-sm text-amber-600">Problemas</p>
            <p className="text-xs text-amber-500 mt-1">
              {problemasAbertos === 0 ? 'Tudo funcionando!' : 'Precisam de atenção'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action Final */}
      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 border-none text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">🚀 Ação do Dia</h3>
          <p className="text-lg mb-4">
            {campanhasParaMeta <= 5 
              ? `Você está a apenas ${campanhasParaMeta} campanhas da sua meta de 10K!`
              : `Acelere! Com ${Math.min(10, campanhasParaMeta)} campanhas hoje, você fica muito mais perto dos 10K!`
            }
          </p>
          <div className="flex justify-center items-center space-x-6 text-green-100">
            <div className="text-center">
              <div className="text-2xl font-bold">{campanhasParaMeta}</div>
              <div className="text-sm">campanhas para meta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(metaDiaria)}</div>
              <div className="text-sm">por dia restante</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{diasRestantesMes}</div>
              <div className="text-sm">dias restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
