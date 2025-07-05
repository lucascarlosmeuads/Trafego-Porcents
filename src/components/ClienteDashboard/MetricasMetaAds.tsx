
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClienteMetaAdsWidget } from './ClienteMetaAdsWidget'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { BarChart3, AlertCircle, CheckCircle, Clock, TrendingUp, Target, Shield, Heart, Sparkles, Award, Activity } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export function MetricasMetaAds() {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')

  if (!cliente) {
    return (
      <Card className="info-card animate-fade-in-up">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-trafego text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="page-title text-gray-900 dark:text-gray-100">Dados dos Anúncios</span>
              <p className="page-subtitle mt-1 text-gray-600 dark:text-gray-400">Carregando suas informações...</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="info-card-warning border-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20 text-orange-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                <div className="space-y-2">
                  <p className="font-semibold">Carregando suas informações...</p>
                  <p className="text-sm">Aguarde enquanto preparamos seus dados personalizados</p>
                </div>
              </AlertDescription>
            </div>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const campanhaAtiva = cliente.status_campanha?.includes('Ativa') || 
                      cliente.status_campanha?.includes('Otimização')

  return (
    <div className="dashboard-container space-y-8 animate-fade-in-up">
      {/* Header principal redesenhado */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-trafego text-white shadow-glow-blue">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Resultados dos seus Anúncios
            </h1>
            <p className="page-subtitle text-lg text-gray-700 dark:text-gray-300">
              Acompanhe em tempo real como seus anúncios estão gerando resultados
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <Badge className="trust-badge">
            <Award className="w-3 h-3 mr-1" />
            Dados Verificados
          </Badge>
          <Badge className="monitoring-badge">
            <Activity className="w-3 h-3 mr-1" />
            Monitoramento 24/7
          </Badge>
          <Badge className="professional-badge">
            <Sparkles className="w-3 h-3 mr-1" />
            Em Tempo Real
          </Badge>
        </div>
      </div>

      {/* Status da Campanha redesenhado */}
      <Card className="info-card hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
              campanhaAtiva 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            }`}>
              {campanhaAtiva ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Status Atual: 
                </h3>
                <Badge className={`text-sm font-medium ${
                  campanhaAtiva 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                }`}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {cliente.status_campanha || 'Em preparação'}
                </Badge>
              </div>
              {!campanhaAtiva && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Seus dados ficam disponíveis assim que os anúncios começarem a rodar. 
                  Nossa equipe está preparando tudo nos bastidores! 🚀
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget de Métricas */}
      <ClienteMetaAdsWidget 
        clienteId={cliente.id.toString()} 
        nomeCliente={cliente.nome_cliente || 'Cliente'} 
      />

      {/* Card informativo para campanhas inativas */}
      {!campanhaAtiva && (
        <Card className="info-card-primary hover-lift">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-2xl bg-gradient-trafego text-white mb-6">
                <TrendingUp className="h-10 w-10" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold font-display text-blue-900 dark:text-blue-100 mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  🚀 Seus Anúncios em Preparação!
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
                  Nossa equipe está configurando sua campanha com as melhores práticas do mercado. 
                  Em breve você terá acesso a dados em tempo real!
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📈 Dashboard Completo</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Assim que seus anúncios estiverem no ar, você verá aqui:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          Pessoas alcançadas em tempo real
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          Cliques e engajamento detalhados
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          Custo por contato otimizado
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          Projeções de conversão inteligentes
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="info-card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 p-6 rounded-xl border border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-600">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💙 Fique Tranquilo!</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        Nossa equipe cuida de tudo nos bastidores com tecnologia avançada. 
                        Estes relatórios são para você se sentir seguro e acompanhar 
                        o progresso do nosso trabalho em tempo real.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className="trust-badge text-xs">
                          ✅ Equipe Especializada
                        </Badge>
                        <Badge className="monitoring-badge text-xs">
                          🛡️ Monitoramento Ativo
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de confiança para campanhas ativas */}
      {campanhaAtiva && (
        <Card className="info-card-success hover-lift">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-green-900 dark:text-green-100 mb-3 flex items-center justify-center gap-2">
                  <Award className="h-6 w-6" />
                  🛡️ Sua Campanha Está Sendo Monitorada
                </h3>
                <p className="text-green-800 dark:text-green-200 text-lg max-w-3xl mx-auto leading-relaxed">
                  Nossa equipe trabalha 24/7 com tecnologia avançada para maximizar seus resultados
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="info-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Equipe Dedicada</h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Analistas monitorando seus resultados diariamente
                  </p>
                </div>
                
                <div className="info-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Otimização Automática</h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Ajustes inteligentes baseados em dados em tempo real
                  </p>
                </div>
                
                <div className="info-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Resultados Inteligentes</h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Estratégias avançadas para maximizar performance
                  </p>
                </div>
                
                <div className="info-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Suporte Dedicado</h4>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Atendimento especializado sempre disponível
                  </p>
                </div>
              </div>
              
              <div className="info-card bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-xl border border-green-200 dark:border-green-800/30">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/20 text-green-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 dark:text-green-100 text-lg mb-2 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      🌟 Você Está em Excelentes Mãos!
                    </h4>
                    <p className="text-green-800 dark:text-green-200 leading-relaxed mb-3">
                      Estes dados são fornecidos para sua <strong>total transparência e tranquilidade</strong>. 
                      Nossa equipe já está trabalhando com base neles para maximizar seus resultados com 
                      tecnologia de ponta e estratégias comprovadas!
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge className="trust-badge text-xs">
                        🏆 Equipe Certificada
                      </Badge>
                      <Badge className="monitoring-badge text-xs">
                        📊 Dados em Tempo Real
                      </Badge>
                      <Badge className="professional-badge text-xs">
                        ⚡ Otimização Avançada
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
