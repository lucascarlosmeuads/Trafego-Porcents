
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface GamifiedMetricsProps {
  clientes: Cliente[]
}

// Simple Progress component to avoid provider issues
const SimpleProgress = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div 
        className="bg-gray-600 h-3 rounded-full transition-all duration-300 ease-out"
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
  
  // CÁLCULOS PARA A META
  const progressoMeta = Math.min(100, (totalRecebido30Dias / META_MENSAL) * 100)
  const faltaParaMeta = Math.max(0, META_MENSAL - totalRecebido30Dias)
  const campanhasParaMeta = Math.ceil(faltaParaMeta / TICKET_MEDIO)
  
  // Dias restantes no mês
  const diasRestantesMes = Math.max(1, Math.ceil((new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)))
  const vendasPorDia = Math.ceil(campanhasParaMeta / diasRestantesMes)
  
  // Sistema de níveis baseado no progresso
  const getNivel = (progresso: number) => {
    if (progresso >= 90) return { nivel: 'Expert', emoji: '👑', cor: 'text-blue-600' }
    if (progresso >= 70) return { nivel: 'Avançado', emoji: '🚀', cor: 'text-blue-500' }
    if (progresso >= 50) return { nivel: 'Intermediário', emoji: '⭐', cor: 'text-gray-600' }
    if (progresso >= 25) return { nivel: 'Progredindo', emoji: '📈', cor: 'text-gray-500' }
    return { nivel: 'Iniciante', emoji: '🎯', cor: 'text-gray-400' }
  }

  const nivelAtual = getNivel(progressoMeta)

  // Mensagem motivacional objetiva
  const getMensagemFoco = () => {
    if (progressoMeta >= 90) return `Faltam apenas ${formatCurrency(faltaParaMeta)} para completar sua meta!`
    if (progressoMeta >= 50) return `Você está na metade do caminho! ${campanhasParaMeta} campanhas restantes.`
    return `Meta: ${campanhasParaMeta} campanhas para atingir R$ 10.000,00`
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* SEÇÃO PRINCIPAL: PROGRESSO DA META */}
      <div className="max-w-4xl mx-auto">
        {/* Hero - Progresso da Meta */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-8">
            {/* Header com Nível */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meta Mensal</h1>
                  <p className="text-gray-500">R$ 10.000,00</p>
                </div>
              </div>
              <Badge variant="secondary" className={`${nivelAtual.cor} bg-gray-100 border-0 text-sm font-medium`}>
                {nivelAtual.emoji} {nivelAtual.nivel}
              </Badge>
            </div>

            {/* Progresso Visual Principal */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(totalRecebido30Dias)}</span>
                  <span className="text-lg text-gray-500 ml-2">de {formatCurrency(META_MENSAL)}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-600">{progressoMeta.toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">completo</div>
                </div>
              </div>
              
              <SimpleProgress value={progressoMeta} className="h-3 bg-gray-200" />
              
              <div className="text-center">
                <p className="text-lg text-gray-700 font-medium">{getMensagemFoco()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO: NÚMEROS ESSENCIAIS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{campanhasAtivas}</div>
                  <div className="text-sm text-gray-500">Campanhas Ativas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPendente)}</div>
                  <div className="text-sm text-gray-500">Aguardando</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{campanhasParaMeta}</div>
                  <div className="text-sm text-gray-500">Campanhas Restantes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{vendasPorDia}</div>
                  <div className="text-sm text-gray-500">Vendas/dia</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEÇÃO: PRÓXIMOS PASSOS */}
        <Card className="border-0 shadow-sm bg-white mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
              Próximos Passos para Atingir a Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Call to Action Principal */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campanhasParaMeta <= 5 ? 'Reta final!' : 'Foco no essencial'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {campanhasParaMeta <= 5 
                      ? `Apenas ${campanhasParaMeta} campanhas para bater a meta de 10K!`
                      : `Ative ${Math.min(10, campanhasParaMeta)} campanhas para acelerar rumo à meta.`
                    }
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            {/* Plano de Ação */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">Meta Diária</div>
                <div className="text-sm text-blue-700">
                  {vendasPorDia} vendas por dia nos próximos {diasRestantesMes} dias
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Potencial</div>
                <div className="text-sm text-green-700">
                  Com {campanhasAtivas} campanhas ativas: {formatCurrency(campanhasAtivas * TICKET_MEDIO)}
                </div>
              </div>
            </div>

            {/* Conquistas Sutis */}
            {progressoMeta > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">Conquistas:</span>
                  {progressoMeta >= 25 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">
                      ⭐ 25% Meta
                    </Badge>
                  )}
                  {progressoMeta >= 50 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">
                      🚀 Metade
                    </Badge>
                  )}
                  {progressoMeta >= 75 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0">
                      🏆 75% Meta
                    </Badge>
                  )}
                  {progressoMeta >= 100 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-600 border-0">
                      👑 Meta Batida!
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
