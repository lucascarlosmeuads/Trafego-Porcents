
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Trophy, Zap, Rocket, Star, Crown } from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface GamifiedMetricsProps {
  clientes: Cliente[]
}

// Componente Progress com design suave e produtivo
const ProductivityProgress = ({ value, className }: { value: number; className?: string }) => {
  const getProgressGradient = (progress: number) => {
    if (progress >= 80) return 'from-success-green to-tech-purple'
    if (progress >= 50) return 'from-tech-purple to-success-green'
    if (progress >= 25) return 'from-tech-purple/80 to-tech-purple'
    return 'from-tech-purple/60 to-tech-purple/80'
  }
  
  return (
    <div className={`progress-bar ${className}`}>
      <div 
        className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${getProgressGradient(value)}`}
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
  
  // Sistema de conquistas com design suave
  const conquistas = []
  
  if (progressoMeta >= 80) {
    conquistas.push({ icon: '👑', texto: 'Quase lá! Meta 10K quase batida!', cor: 'status-success' })
  } else if (progressoMeta >= 50) {
    conquistas.push({ icon: '🚀', texto: 'Metade do caminho conquistada!', cor: 'status-tech' })
  } else if (progressoMeta >= 25) {
    conquistas.push({ icon: '⭐', texto: '25% da meta alcançada!', cor: 'status-tech' })
  }
  
  if (campanhasAtivas >= 10) {
    conquistas.push({ icon: '🔥', texto: 'Máquina de vendas ativada!', cor: 'status-success' })
  }
  
  if (totalRecebido30Dias > 0) {
    conquistas.push({ icon: '💰', texto: 'Faturamento ativo este mês!', cor: 'status-success' })
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
      return `💪 ${campanhasAtivas} campanhas no ar! Vamos acelerar?`
    }
    return `🎯 Sua meta de 10K está esperando! Com ${campanhasParaMeta} campanhas ativas, você chega lá!`
  }

  return (
    <div className="space-y-8 bg-deep-blue min-h-screen p-6">
      {/* Mensagem Motivacional Principal */}
      <Card className="productivity-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-tech-purple/20 p-3 rounded-xl">
              <Crown className="h-8 w-8 text-tech-purple" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold mb-3 text-primary-text">{getMensagemMotivacional()}</p>
              <div className="flex flex-wrap items-center gap-6 text-secondary-text">
                <span className="flex items-center gap-2">
                  Meta: <span className="text-success-green font-semibold">{formatCurrency(META_MENSAL)}</span>
                </span>
                <span className="text-info-text">•</span>
                <span className="flex items-center gap-2">
                  Conquistado: <span className="text-success-green font-semibold">{formatCurrency(totalRecebido30Dias)}</span>
                </span>
                <span className="text-info-text">•</span>
                <span className="flex items-center gap-2">
                  Faltam: <span className="text-warning-orange font-semibold">{formatCurrency(faltaParaMeta)}</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso da Meta de 10K */}
      <Card className="productivity-card">
        <CardHeader className="pb-4">
          <CardTitle className="section-header flex items-center">
            <Target className="h-6 w-6 mr-3 text-tech-purple" />
            Progresso da Meta: R$ 10.000,00
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="metric-value text-success-green">{formatCurrency(totalRecebido30Dias)}</span>
            <span className="text-xl font-semibold text-tech-purple">{progressoMeta.toFixed(1)}%</span>
          </div>
          <ProductivityProgress value={progressoMeta} />
          <div className="grid grid-cols-3 gap-4">
            <div className="productivity-card p-4 text-center">
              <div className="metric-title text-warning-orange">Faltam</div>
              <div className="metric-value text-warning-orange text-lg">{formatCurrency(faltaParaMeta)}</div>
            </div>
            <div className="productivity-card p-4 text-center">
              <div className="metric-title text-tech-purple">Campanhas necessárias</div>
              <div className="metric-value text-tech-purple text-lg">{campanhasParaMeta}</div>
            </div>
            <div className="productivity-card p-4 text-center">
              <div className="metric-title text-success-green">Vendas por dia</div>
              <div className="metric-value text-success-green text-lg">{vendasPorDia}</div>
            </div>
          </div>
          <div className="text-center metric-description">
            Você precisa de <span className="text-warning-orange font-semibold">{vendasPorDia} vendas por dia</span> para bater essa meta
          </div>
        </CardContent>
      </Card>

      {/* Métricas Essenciais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="productivity-card">
          <CardHeader className="pb-3">
            <CardTitle className="metric-title flex items-center text-tech-purple">
              <Rocket className="h-4 w-4 mr-2" />
              Campanhas no Ar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-tech-purple">{campanhasAtivas}</div>
            <p className="metric-description">
              ativas agora 🚀
            </p>
          </CardContent>
        </Card>

        <Card className="productivity-card">
          <CardHeader className="pb-3">
            <CardTitle className="metric-title flex items-center text-success-green">
              <Trophy className="h-4 w-4 mr-2" />
              Já Conquistado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-success-green">{formatCurrency(totalRecebido30Dias)}</div>
            <p className="metric-description">
              dos seus 10K 💰
            </p>
          </CardContent>
        </Card>

        <Card className="productivity-card">
          <CardHeader className="pb-3">
            <CardTitle className="metric-title flex items-center text-warning-orange">
              <Star className="h-4 w-4 mr-2" />
              Aguardando Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-warning-orange">{formatCurrency(totalPendente)}</div>
            <p className="metric-description">
              {clientesPendentes.length} comissões ⭐
            </p>
          </CardContent>
        </Card>

        <Card className="productivity-card">
          <CardHeader className="pb-3">
            <CardTitle className="metric-title flex items-center text-tech-purple">
              <Zap className="h-4 w-4 mr-2" />
              Meta Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-tech-purple">{formatCurrency(metaDiaria)}</div>
            <p className="metric-description">
              para chegar nos 10K ⚡
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas */}
      {conquistas.length > 0 && (
        <Card className="productivity-card">
          <CardHeader className="pb-4">
            <CardTitle className="section-header flex items-center">
              <Trophy className="h-5 w-5 mr-3 text-tech-purple" />
              Suas Conquistas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {conquistas.map((conquista, index) => (
                <Badge key={index} className={`${conquista.cor} px-4 py-2 text-sm font-medium`}>
                  <span className="mr-2 text-lg">{conquista.icon}</span>
                  {conquista.texto}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action Consolidado */}
      <Card className="productivity-card border-tech-purple/30">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-3 text-tech-purple">🚀 Acelere rumo aos 10K!</h3>
            <p className="text-lg text-primary-text">
              Com {Math.min(10, campanhasParaMeta)} campanhas ativas hoje, você se aproxima da meta!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
            <div className="productivity-card p-4">
              <div className="metric-value text-warning-orange">{campanhasParaMeta}</div>
              <div className="metric-description">campanhas faltam</div>
            </div>
            <div className="productivity-card p-4">
              <div className="metric-value text-success-green">{formatCurrency(metaDiaria)}</div>
              <div className="metric-description">por dia restante</div>
            </div>
            <div className="productivity-card p-4">
              <div className="metric-value text-tech-purple">{diasRestantesMes}</div>
              <div className="metric-description">dias restantes</div>
            </div>
          </div>

          {/* Projeções de crescimento */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="productivity-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-tech-purple">Com +5 campanhas</span>
                <span className="text-2xl">🚀</span>
              </div>
              <div className="metric-value text-tech-purple text-xl">{formatCurrency(totalRecebido30Dias + (5 * TICKET_MEDIO))}</div>
              <div className="metric-description text-tech-purple">
                {(totalRecebido30Dias + (5 * TICKET_MEDIO)) >= META_MENSAL ? '✅ Meta batida!' : `Faltariam ${formatCurrency(META_MENSAL - (totalRecebido30Dias + (5 * TICKET_MEDIO)))}`}
              </div>
            </div>
            
            <div className="productivity-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-success-green">Com +10 campanhas</span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="metric-value text-success-green text-xl">{formatCurrency(totalRecebido30Dias + (10 * TICKET_MEDIO))}</div>
              <div className="metric-description text-success-green">
                {(totalRecebido30Dias + (10 * TICKET_MEDIO)) >= META_MENSAL ? '🏆 Meta ultrapassada!' : `Faltariam ${formatCurrency(META_MENSAL - (totalRecebido30Dias + (10 * TICKET_MEDIO)))}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
