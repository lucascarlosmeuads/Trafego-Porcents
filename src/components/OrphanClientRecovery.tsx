
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { detectAndRecoverOrphanClients, recoverSpecificOrphanClient } from '@/utils/orphanClientRecovery'

interface RecoveryResult {
  email: string
  status: 'recovered' | 'already_exists' | 'error'
  message: string
}

export function OrphanClientRecovery() {
  const [processing, setProcessing] = useState(false)
  const [specificEmail, setSpecificEmail] = useState('')
  const [specificProcessing, setSpecificProcessing] = useState(false)
  const [results, setResults] = useState<RecoveryResult[]>([])
  const { toast } = useToast()

  const executeFullRecovery = async () => {
    setProcessing(true)
    console.log('🚀 [OrphanClientRecovery] Iniciando recuperação completa')

    try {
      const recoveryResults = await detectAndRecoverOrphanClients()
      setResults(recoveryResults)
      
      const recovered = recoveryResults.filter(r => r.status === 'recovered').length
      const errors = recoveryResults.filter(r => r.status === 'error').length
      
      toast({
        title: "Recuperação Concluída",
        description: `${recovered} clientes recuperados, ${errors} erros`,
        variant: recovered > 0 ? "default" : "destructive"
      })

    } catch (error) {
      console.error('💥 [OrphanClientRecovery] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado na recuperação",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const executeSpecificRecovery = async () => {
    if (!specificEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite um e-mail válido",
        variant: "destructive"
      })
      return
    }

    setSpecificProcessing(true)
    console.log('🎯 [OrphanClientRecovery] Recuperando cliente específico:', specificEmail)

    try {
      const result = await recoverSpecificOrphanClient(specificEmail.trim())
      
      setResults([result])
      
      toast({
        title: result.status === 'recovered' ? "Sucesso" : 
               result.status === 'already_exists' ? "Informação" : "Erro",
        description: result.message,
        variant: result.status === 'error' ? "destructive" : "default"
      })

    } catch (error) {
      console.error('💥 [OrphanClientRecovery] Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado na recuperação",
        variant: "destructive"
      })
    } finally {
      setSpecificProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recovered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'already_exists':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recovered':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'already_exists':
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
            <UserCheck className="w-5 h-5" />
            Recuperação de Clientes Órfãos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">O que são clientes órfãos?</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Clientes que existem no sistema de autenticação (podem fazer login)</li>
              <li>• Mas NÃO existem na tabela de clientes (não aparecem no painel)</li>
              <li>• Resultado: "Acesso Negado" mesmo com login correto</li>
              <li>• Esta ferramenta detecta e corrige automaticamente esses casos</li>
            </ul>
          </div>

          {/* Recuperação Completa */}
          <div className="space-y-4">
            <h3 className="font-semibold">Recuperação Automática (Todos os Órfãos)</h3>
            <Button
              onClick={executeFullRecovery}
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detectando e recuperando...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Detectar e Recuperar Todos os Órfãos
                </>
              )}
            </Button>
          </div>

          {/* Recuperação Específica */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Recuperação Manual (Cliente Específico)</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="specific-email">E-mail do Cliente</Label>
                <Input
                  id="specific-email"
                  type="email"
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  disabled={specificProcessing}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={executeSpecificRecovery}
                  disabled={specificProcessing || !specificEmail.trim()}
                >
                  {specificProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Recuperar'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {results.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Resultados da Recuperação</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {results.filter(r => r.status === 'recovered').length}
                  </div>
                  <div className="text-sm text-green-600">Recuperados</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-700">
                    {results.filter(r => r.status === 'already_exists').length}
                  </div>
                  <div className="text-sm text-yellow-600">Já Existiam</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-700">
                    {results.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-red-600">Erros</div>
                </div>
              </div>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">
                    Detalhes ({results.length} processados)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.status)}`}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">{result.email}</div>
                            <div className="text-sm opacity-75">{result.message}</div>
                          </div>
                        </div>
                        <div className="text-xs font-medium uppercase tracking-wide">
                          {result.status === 'recovered' ? 'RECUPERADO' :
                           result.status === 'already_exists' ? 'JÁ EXISTIA' : 'ERRO'}
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
