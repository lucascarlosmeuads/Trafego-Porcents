
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClienteMetaAdsWidget } from './ClienteMetaAdsWidget'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { BarChart3, AlertCircle, CheckCircle, Clock, TrendingUp, Target, Shield, Heart } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function MetricasMetaAds() {
  const { user } = useAuth()
  const { cliente } = useClienteData(user?.email || '')

  if (!cliente) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Relatório dos Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Carregando suas informações...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const campanhaAtiva = cliente.status_campanha?.includes('Ativa') || 
                      cliente.status_campanha?.includes('Otimização')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📊 Relatório dos Anúncios</h1>
        <p className="text-muted-foreground">Acompanhe como seus anúncios estão performando e gerando resultados</p>
      </div>

      {/* Status da Campanha com linguagem mais tranquilizadora */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {campanhaAtiva ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <p className="font-medium text-foreground">
                Status atual: <span className="text-primary">{cliente.status_campanha || 'Em preparação'}</span>
              </p>
              {!campanhaAtiva && (
                <p className="text-sm text-muted-foreground">
                  Seus dados ficam disponíveis assim que os anúncios começarem a rodar
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget de Métricas - sempre mostrar se possível */}
      <ClienteMetaAdsWidget 
        clienteId={cliente.id.toString()} 
        nomeCliente={cliente.nome_cliente || 'Cliente'} 
      />

      {/* Informação educativa e tranquilizadora para clientes novos */}
      {!campanhaAtiva && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">🚀 Seus anúncios em preparação!</h3>
              </div>
              
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">📈 Dados em tempo real</p>
                    <p>Assim que seus anúncios começarem a rodar, você verá aqui:</p>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li>• Quantas pessoas estão vendo seus anúncios</li>
                      <li>• Quantos cliques e visitas você está recebendo</li>
                      <li>• Quanto está custando para gerar cada contato</li>
                      <li>• Estimativa de custo por venda</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-100 p-3 rounded flex items-start gap-2">
                  <Heart className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">💙 Fique tranquilo!</p>
                    <p>Nossa equipe cuida de tudo nos bastidores. Estes relatórios são para você se sentir seguro e ver o progresso do nosso trabalho em tempo real. Não precisa se preocupar - nós monitoramos e otimizamos constantemente!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de tranquilização para campanhas ativas */}
      {campanhaAtiva && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">🛡️ Sua campanha está sendo monitorada</h3>
              </div>
              
              <div className="text-sm text-green-800 space-y-2">
                <p>✅ <strong>Equipe especializada</strong> analisando seus resultados diariamente</p>
                <p>🔄 <strong>Otimizações automáticas</strong> para melhorar performance</p>
                <p>📊 <strong>Ajustes inteligentes</strong> baseados nos dados em tempo real</p>
                <p>💬 <strong>Suporte dedicado</strong> sempre disponível para você</p>
              </div>
              
              <div className="bg-green-100 p-3 rounded">
                <p className="text-sm text-green-800">
                  <strong>🌟 Lembre-se:</strong> Estes dados são para sua tranquilidade e transparência. 
                  Nossa equipe já está trabalhando com base neles para maximizar seus resultados!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
