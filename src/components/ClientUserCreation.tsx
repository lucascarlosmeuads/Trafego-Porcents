
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Users, CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProcessResult {
  email: string
  operation: 'created' | 'updated' | 'skipped' | 'error'
  message: string
}

interface ProcessResponse {
  success: boolean
  message: string
  statistics: {
    total: number
    created: number
    updated: number
    skipped: number
    errors: number
  }
  results: ProcessResult[]
}

export function ClientUserCreation() {
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ProcessResponse | null>(null)
  const { toast } = useToast()

  const executeCreation = async () => {
    setProcessing(true)
    console.log('🚀 [ClientUserCreation] Iniciando criação de usuários clientes')

    try {
      const { data, error } = await supabase.functions.invoke('create-client-users', {
        body: {}
      })

      if (error) {
        console.error('❌ [ClientUserCreation] Erro na função:', error)
        toast({
          title: "Erro",
          description: `Erro ao processar usuários: ${error.message}`,
          variant: "destructive"
        })
        return
      }

      console.log('✅ [ClientUserCreation] Processamento concluído:', data)
      setResults(data)
      
      toast({
        title: "Processamento Concluído",
        description: `${data.statistics.total} e-mails processados com sucesso`,
      })

    } catch (error) {
      console.error('💥 [ClientUserCreation] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar usuários",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'created':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'updated':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'created':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'updated':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'skipped':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Users className="w-5 h-5" />
            Criação de Usuários para Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Como funciona:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Percorre todos os e-mails na coluna email_cliente</li>
              <li>• Cria novos usuários ou atualiza senha para: <code className="bg-blue-100 px-1 rounded">parceriadesucesso</code></li>
              <li>• Ignora e-mails de gestores/admins automaticamente</li>
              <li>• Permite login imediato para todos os clientes</li>
            </ul>
          </div>

          <Button
            onClick={executeCreation}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando usuários...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar Criação de Usuários
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{results.statistics.created}</div>
                  <div className="text-sm text-green-600">Criados</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{results.statistics.updated}</div>
                  <div className="text-sm text-blue-600">Atualizados</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-700">{results.statistics.skipped}</div>
                  <div className="text-sm text-yellow-600">Ignorados</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-700">{results.statistics.errors}</div>
                  <div className="text-sm text-red-600">Erros</div>
                </div>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">
                    Detalhes do Processamento ({results.statistics.total} e-mails)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {results.results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getOperationColor(result.operation)}`}
                      >
                        <div className="flex items-center gap-3">
                          {getOperationIcon(result.operation)}
                          <div>
                            <div className="font-medium">{result.email}</div>
                            <div className="text-sm opacity-75">{result.message}</div>
                          </div>
                        </div>
                        <div className="text-xs font-medium uppercase tracking-wide">
                          {result.operation}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
