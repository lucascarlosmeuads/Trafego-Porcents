
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Filter, TrendingUp, Sparkles, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DateFilterWidgetProps {
  currentPeriod: string
  onPeriodChange: (period: string, startDate?: string, endDate?: string) => void
  loading?: boolean
}

export function DateFilterWidget({ currentPeriod, onPeriodChange, loading }: DateFilterWidgetProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const periodOptions = [
    { value: 'today', label: 'Hoje', icon: '📅', description: 'Dados de hoje' },
    { value: 'yesterday', label: 'Ontem', icon: '📆', description: 'Dados de ontem' },
    { value: 'day_before_yesterday', label: 'Anteontem', icon: '📋', description: 'Dados anteontem' },
    { value: 'last_7_days', label: '7 dias', icon: '📊', description: 'Últimos 7 dias' },
    { value: 'last_15_days', label: '15 dias', icon: '📈', description: 'Últimos 15 dias' },
    { value: 'last_30_days', label: '30 dias', icon: '📉', description: 'Últimos 30 dias' },
    { value: 'custom', label: 'Personalizado', icon: '🎯', description: 'Período customizado' }
  ]

  const handlePeriodSelect = (period: string) => {
    if (period === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      onPeriodChange(period)
    }
  }

  const handleCustomSubmit = () => {
    if (customStartDate && customEndDate) {
      onPeriodChange('custom', customStartDate, customEndDate)
      setShowCustom(false)
    }
  }

  const getCurrentPeriodLabel = () => {
    const option = periodOptions.find(opt => opt.value === currentPeriod)
    return option ? `${option.icon} ${option.label}` : '📅 Período selecionado'
  }

  return (
    <Card className="info-card info-card-primary mb-6 animate-fade-in-up">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header com status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-trafego text-white">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <h3 className="section-title">Período dos Dados</h3>
                <p className="text-sm text-muted-foreground">Selecione o período para análise</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="monitoring-badge">
                <Sparkles className="h-3 w-3 mr-1" />
                Tempo Real
              </Badge>
              <div className="text-sm font-medium text-foreground bg-gradient-card px-3 py-1.5 rounded-lg border border-border/50">
                {getCurrentPeriodLabel()}
              </div>
            </div>
          </div>

          {/* Botões de período */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant="outline"
                onClick={() => handlePeriodSelect(option.value)}
                disabled={loading}
                className={`period-button group relative ${
                  currentPeriod === option.value 
                    ? 'period-button-active' 
                    : 'hover:shadow-card-hover'
                }`}
                title={option.description}
              >
                <span className="text-base mr-2 group-hover:scale-110 transition-transform">
                  {option.icon}
                </span>
                <span className="font-medium">{option.label}</span>
                {currentPeriod === option.value && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            ))}
          </div>

          {/* Filtro personalizado */}
          {showCustom && (
            <div className="info-card bg-gradient-card p-5 space-y-4 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-trafego text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Período Personalizado</h4>
                  <p className="text-sm text-muted-foreground">Defina suas datas específicas</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Data início:
                  </label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border-border/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Data fim:
                  </label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border-border/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleCustomSubmit}
                    disabled={!customStartDate || !customEndDate || loading}
                    className="w-full bg-gradient-trafego hover:bg-gradient-trafego-hover text-white font-medium hover-lift"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Aplicar Período
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de confiança */}
          <div className="info-card-success p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 text-green-600">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Monitoramento Profissional 24/7
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                  Nossa equipe de especialistas monitora estes dados continuamente e faz ajustes automáticos 
                  para otimizar seus resultados. Você pode acompanhar nosso trabalho em tempo real através 
                  destes relatórios profissionais.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Badge variant="secondary" className="trust-badge text-xs">
                    ✅ Dados Verificados
                  </Badge>
                  <Badge variant="secondary" className="monitoring-badge text-xs">
                    🔄 Auto-Otimização
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
