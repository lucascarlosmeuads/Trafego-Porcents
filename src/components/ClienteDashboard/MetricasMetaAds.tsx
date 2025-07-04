
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClienteMetaAdsWidget } from './ClienteMetaAdsWidget'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { BarChart3, AlertCircle } from 'lucide-react'
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

  const campanhaAtiva = cliente.status_campanha?.includes('Ativa') || 
                      cliente.status_campanha?.includes('Otimização')

  if (!campanhaAtiva) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Métricas da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-medium">Campanha ainda não está ativa</p>
                <p className="text-sm">
                  As métricas do Meta Ads aparecerão aqui assim que sua campanha estiver rodando.
                </p>
                <p className="text-sm">
                  <strong>Status atual:</strong> {cliente.status_campanha || 'Em configuração'}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Métricas da Campanha</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho das suas campanhas no Meta Ads</p>
      </div>

      <ClienteMetaAdsWidget 
        clienteId={cliente.id.toString()} 
        nomeCliente={cliente.nome_cliente || 'Cliente'} 
      />
    </div>
  )
}
