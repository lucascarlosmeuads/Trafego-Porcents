
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
    <Card className="mobile-info-card info-card-primary mobile-mb animate-fade-in-up">
      <CardContent className="mobile-p">
        <div className="mobile-content-spacing">
          {/* Header otimizado para máximo aproveitamento horizontal */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-trafego text-white flex-shrink-0">
                <Filter className="mobile-icon-sm" />
              </div>
              <div className="min-w-0">
                <h3 className="mobile-section-title text-gray-900 dark:text-gray-100">Período dos Dados</h3>
                <p className="mobile-description text-gray-600 dark:text-gray-400">Selecione o período para análise</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1">
              <Badge className="monitoring-badge text-xs">
                <Sparkles className="mobile-icon-sm mr-1" />
                Tempo Real
              </Badge>
              <div className="mobile-description font-medium text-gray-900 dark:text-gray-100 bg-gradient-card px-2 py-1 rounded-lg border border-border/50 text-xs">
                {getCurrentPeriodLabel()}
              </div>
            </div>
          </div>

          {/* Botões de período com máximo aproveitamento das laterais */}
          <div className="mobile-date-grid">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant="outline"
                onClick={() => handlePeriodSelect(option.value)}
                disabled={loading}
                className={`mobile-period-button group relative text-xs ${
                  currentPeriod === option.value 
                    ? 'period-button-active text-white font-semibold' 
                    : 'hover:shadow-card-hover text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
                title={option.description}
              >
                <span className="text-xs mr-1 group-hover:scale-110 transition-transform">
                  {option.icon}
                </span>
                <span className="font-medium text-xs truncate">{option.label}</span>
                {currentPeriod === option.value && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            ))}
          </div>

          {/* Filtro personalizado com máximo aproveitamento horizontal */}
          {showCustom && (
            <div className="info-card bg-gradient-card mobile-p space-y-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-trafego text-white flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Período Personalizado</h4>
                  <p className="mobile-description text-gray-600 dark:text-gray-400">Defina suas datas específicas</p>
                </div>
              </div>
              
              <div className="mobile-form-grid">
                <div className="space-y-1">
                  <label className="mobile-description font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    Data início:
                  </label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border-border/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 bg-background/50 backdrop-blur-sm mobile-touch-target text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="mobile-description font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    Data fim:
                  </label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border-border/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 bg-background/50 backdrop-blur-sm mobile-touch-target text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleCustomSubmit}
                    disabled={!customStartDate || !customEndDate || loading}
                    className="w-full bg-gradient-trafego hover:bg-gradient-trafego-hover text-white font-medium hover-lift mobile-touch-target text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="mobile-description">Aplicar Período</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de confiança com aproveitamento total das laterais */}
          <div className="info-card-success mobile-p rounded-xl">
            <div className="flex items-start gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-500/20 text-green-600 flex-shrink-0">
                <Shield className="h-3 w-3" />
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-1 text-sm">
                  <Sparkles className="h-3 w-3 flex-shrink-0" />
                  Monitoramento Ativo 24/7
                </h4>
                <p className="mobile-description text-green-800 dark:text-green-200 leading-relaxed">
                  Nossa equipe monitora estes dados continuamente e faz ajustes automáticos para otimizar seus resultados. Você pode acompanhar nosso trabalho em tempo real através destes relatórios.
                </p>
                <div className="flex flex-wrap items-center gap-1 pt-1">
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
