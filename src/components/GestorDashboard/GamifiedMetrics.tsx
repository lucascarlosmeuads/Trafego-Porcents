
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Target, Calendar, Trophy, Zap, Flame } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface GamifiedMetricsProps {
  clientes: Cliente[]
}

export function GamifiedMetrics({ clientes }: GamifiedMetricsProps) {
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
  
  // Calcular média diária (considerando apenas dias úteis - 22 dias úteis em 30 dias)
  const diasUteis30Dias = 22
  const mediaDiaria = totalRecebido30Dias / diasUteis30Dias
  
  // Total pendente
  const clientesPendentes = clientes.filter(cliente => 
    cliente.comissao !== 'Pago'
  )
  const totalPendente = clientesPendentes.reduce((total, cliente) => 
    total + (cliente.valor_comissao || 60), 0
  )
  
  // Clientes ativos gerando retorno
  const clientesAtivos = clientes.filter(cliente => 
    cliente.status_campanha === 'Campanha no Ar' || cliente.status_campanha === 'Otimização'
  )
  
  // Campanhas no ar
  const campanhasNoAr = clientesAtivos.length
  
  // Problemas em aberto
  const problemasAbertos = clientes.filter(cliente => 
    cliente.status_campanha === 'Problema'
  ).length
  
  // Calcular projeções
  const diasRestantesMes = Math.max(1, Math.ceil((new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)))
  const diasUteisRestantes = Math.ceil(diasRestantesMes * 0.7) // Aproximadamente 70% são dias úteis
  const projecaoMensal = mediaDiaria * diasUteisRestantes
  
  // Potencial com +1 cliente
  const potencialComMaisUmCliente = (totalRecebido30Dias + 60) / diasUteis30Dias
  
  // Calcular melhor dia (simulação baseada na média)
  const melhorDia = mediaDiaria * 1.8 // Aproximação
  
  // Meta mensal baseada na média histórica
  const metaMensal = mediaDiaria * 22 * 1.2 // 20% acima da média atual
  const progressoMeta = Math.min(100, (totalRecebido30Dias / metaMensal) * 100)
  
  // Sistema de conquistas
  const conquistas = []
  
  if (mediaDiaria > 100) {
    conquistas.push({ icon: '🔥', texto: 'Média diária acima de R$ 100!', cor: 'bg-orange-100 text-orange-800' })
  }
  
  if (campanhasNoAr >= 5) {
    conquistas.push({ icon: '🚀', texto: `${campanhasNoAr} campanhas no ar!`, cor: 'bg-blue-100 text-blue-800' })
  }
  
  if (progressoMeta >= 80) {
    conquistas.push({ icon: '💎', texto: 'Meta mensal quase batida!', cor: 'bg-purple-100 text-purple-800' })
  }
  
  if (totalRecebido30Dias > 0) {
    conquistas.push({ icon: '⭐', texto: 'Ativo nos últimos 30 dias!', cor: 'bg-green-100 text-green-800' })
  }
  
  // Mensagens motivacionais dinâmicas
  const getMensagemMotivacional = () => {
    if (mediaDiaria > 150) {
      return `🔥 Você está com uma média incrível de ${formatCurrency(mediaDiaria)}/dia! Continue assim!`
    }
    if (projecaoMensal > totalRecebido30Dias) {
      return `📈 Se mantiver essa média, pode fechar o mês com ${formatCurrency(projecaoMensal)} a mais!`
    }
    if (campanhasNoAr > 0) {
      return `⚡ ${campanhasNoAr} campanhas gerando resultado! Que tal adicionar mais uma?`
    }
    return `🎯 Sua próxima comissão pode ser hoje! Vamos nessa!`
  }

  return (
    <div className="space-y-6">
      {/* Mensagem Motivacional Principal */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 border-none text-white">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6" />
            <p className="text-lg font-medium">{getMensagemMotivacional()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(totalRecebido30Dias)}</div>
            <p className="text-xs text-green-600 mt-1">
              {clientesPagosRecentes.length} comissões recebidas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Média Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(mediaDiaria)}</div>
            <p className="text-xs text-blue-600 mt-1">
              por dia útil
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Projeção Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(projecaoMensal)}</div>
            <p className="text-xs text-purple-600 mt-1">
              mantendo a média atual
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center">
              <Fire className="h-4 w-4 mr-2" />
              Potencial +1 Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{formatCurrency(potencialComMaisUmCliente)}</div>
            <p className="text-xs text-orange-600 mt-1">
              nova média diária
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progresso da Meta */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Meta Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progresso: {formatCurrency(totalRecebido30Dias)}</span>
              <span className="font-medium">Meta: {formatCurrency(metaMensal)}</span>
            </div>
            <Progress 
              value={progressoMeta} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressoMeta.toFixed(1)}% concluído</span>
              <span>Faltam {formatCurrency(metaMensal - totalRecebido30Dias)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas e Medalhas */}
      {conquistas.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {conquistas.map((conquista, index) => (
                <Badge key={index} className={`${conquista.cor} border-0 px-3 py-1`}>
                  <span className="mr-1">{conquista.icon}</span>
                  {conquista.texto}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-green-600">{campanhasNoAr}</div>
            <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
            <p className="text-xs text-green-600 mt-1">Gerando resultado 🚀</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalPendente)}</div>
            <p className="text-sm text-muted-foreground">Total Pendente</p>
            <p className="text-xs text-red-600 mt-1">{clientesPendentes.length} comissões 💰</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-amber-600">{problemasAbertos}</div>
            <p className="text-sm text-muted-foreground">Problemas Abertos</p>
            <p className="text-xs text-amber-600 mt-1">Requer atenção ⚠️</p>
          </CardContent>
        </Card>
      </div>

      {/* Mensagens de Motivação Específicas */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4">
          <div className="grid gap-2 text-sm">
            <p className="flex items-center text-amber-800">
              <span className="mr-2">🏆</span>
              <strong>Seu melhor potencial hoje:</strong> {formatCurrency(melhorDia)} — bora bater esse recorde?
            </p>
            <p className="flex items-center text-orange-800">
              <span className="mr-2">💡</span>
              <strong>Dica:</strong> Com +1 cliente ativo, sua média diária sobe para {formatCurrency(potencialComMaisUmCliente)}
            </p>
            {totalPendente > 0 && (
              <p className="flex items-center text-green-800">
                <span className="mr-2">💰</span>
                <strong>Potencial total:</strong> {formatCurrency(totalPendente)} aguardando para ser liberado!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
