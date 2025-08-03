import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const KIWIFY_PAID_EMAILS = [
  'pabloalexsander@yahoo.com.br',
  'joao.lima_14@hotmail.com',
  'consultrancm@gmail.com',
  'luisnascimento.eng@hotmail.com',
  'cleitianesilvaesilva@gmail.com', // corrigido o .om para .com
  'ranotecmt4@gmail.com',
  'masterimoveis.consultoria@hotmail.com',
  'marcoswells77@gmail.com',
  'rayestte@yahoo.com.br',
  'copetti2006@gmail.com',
  'vidaleve.barreiras@gmail.com',
  'nelsolar.nelsolar@outlook.com',
  'franciscomilhas1987@yahoo.com',
  'nilvanandrade@hotmail.com',
  'eliel.estudio@gmail.com',
  'dinizcorretorslz@gmail.com'
]

export default function KiwifyRetroactiveProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const processRetroactivePayments = async () => {
    setIsProcessing(true)
    setError(null)
    setResults(null)

    try {
      console.log('🚀 Iniciando processamento retroativo...')
      
      const { data, error } = await supabase.functions.invoke('process-kiwify-retroactive', {
        body: { emails: KIWIFY_PAID_EMAILS }
      })

      if (error) {
        throw new Error(error.message)
      }

      console.log('✅ Processamento concluído:', data)
      setResults(data.results)
      
    } catch (err: any) {
      console.error('❌ Erro no processamento:', err)
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'atualizado':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ja_pago':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'nao_encontrado':
        return <XCircle className="h-4 w-4 text-orange-600" />
      case 'erro':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'atualizado':
        return 'bg-green-100 text-green-800'
      case 'ja_pago':
        return 'bg-blue-100 text-blue-800'
      case 'nao_encontrado':
        return 'bg-orange-100 text-orange-800'
      case 'erro':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Processamento Retroativo - Kiwify</CardTitle>
          <CardDescription>
            Processar vendas aprovadas da Kiwify para marcar leads como pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>{KIWIFY_PAID_EMAILS.length} emails</strong> serão processados das vendas aprovadas da Kiwify
            </p>
            
            <Button 
              onClick={processRetroactivePayments}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Processar Vendas Retroativas'
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Erro no processamento:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{results.processados}</p>
                  <p className="text-sm text-blue-800">Processados</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{results.atualizados}</p>
                  <p className="text-sm text-green-800">Atualizados</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{results.ja_pagos}</p>
                  <p className="text-sm text-yellow-800">Já Pagos</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{results.nao_encontrados}</p>
                  <p className="text-sm text-orange-800">Não Encontrados</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{results.erros}</p>
                  <p className="text-sm text-red-800">Erros</p>
                </div>
              </div>

              {results.detalhes && results.detalhes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Detalhes do Processamento:</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {results.detalhes.map((detalhe: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(detalhe.status)}
                          <span className="font-medium">{detalhe.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(detalhe.status)}>
                            {detalhe.status.replace('_', ' ')}
                          </Badge>
                          {detalhe.lead_id && (
                            <span className="text-xs text-gray-500">
                              ID: {detalhe.lead_id}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}