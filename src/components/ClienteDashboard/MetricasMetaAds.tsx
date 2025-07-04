
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClienteMetaAdsWidget } from './ClienteMetaAdsWidget'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react'
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
            Métricas da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Carregando informações do cliente...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Verificar se o cliente tem Meta Ads configurado através do widget
  const temMetaAdsConfigurado = true // O widget vai fazer a verificação interna

  const campanhaAtiva = cliente.status_campanha?.includes('Ativa') || 
                      cliente.status_campanha?.includes('Otimização')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Métricas da Campanha</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho das suas campanhas no Meta Ads</p>
      </div>

      {/* Status da Campanha */}
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
                Status atual: <span className="text-primary">{cliente.status_campanha || 'Em configuração'}</span>
              </p>
              {!campanhaAtiva && (
                <p className="text-sm text-muted-foreground">
                  Suas métricas estão disponíveis mesmo durante a configuração da campanha
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

      {/* Informação adicional para clientes novos */}
      {!campanhaAtiva && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">📊 Suas métricas já estão disponíveis!</p>
              <p className="text-sm">
                Mesmo com o status "{cliente.status_campanha || 'Cliente Novo'}", você pode acompanhar 
                o desempenho das suas campanhas Meta Ads assim que elas começarem a rodar.
              </p>
              <p className="text-sm">
                <strong>Próximos passos:</strong> Seu gestor finalizará a configuração e sua campanha 
                ficará com status "Ativa" em breve.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
