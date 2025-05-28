
import { DiagnosticResult as ResultType } from './DiagnosticTypes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DiagnosticResultProps {
  result: ResultType
  onApplyCorrections: () => void
  fixing: boolean
}

export function DiagnosticResult({ result, onApplyCorrections, fixing }: DiagnosticResultProps) {
  const { toast } = useToast()

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status === false) return <XCircle className="w-4 h-4 text-red-600" />
    return <AlertTriangle className="w-4 h-4 text-yellow-600" />
  }

  const getStatusColor = (status: boolean | null) => {
    if (status === true) return 'text-green-700 bg-green-50 border-green-200'
    if (status === false) return 'text-red-700 bg-red-50 border-red-200'
    return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      default: return 'outline'
    }
  }

  const copyMessage = () => {
    if (result.clientMessage) {
      navigator.clipboard.writeText(result.clientMessage)
      toast({
        title: "Mensagem Copiada",
        description: "Mensagem copiada para área de transferência"
      })
    }
  }

  const hasCorrectableIssues = result.issues.some(issue => 
    ['missing_user', 'wrong_password', 'unconfirmed_email'].includes(issue.type)
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Resultado para: {result.email}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status checks */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.clienteExistsInDatabase)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.clienteExistsInDatabase)}
                <span className="font-medium">Cliente na Base de Dados</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium uppercase tracking-wide">
                  {result.clienteExistsInDatabase ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}
                </div>
                {result.clienteData && (
                  <div className="text-xs text-gray-600 mt-1">
                    {result.clienteData.nome_cliente}
                  </div>
                )}
                {result.duplicateClientes && result.duplicateClientes.length > 1 && (
                  <div className="text-xs text-orange-600 mt-1">
                    {result.duplicateClientes.length} registros duplicados
                  </div>
                )}
              </div>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.userExistsInAuth)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.userExistsInAuth)}
                <span className="font-medium">Usuário no Auth</span>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide">
                {result.userExistsInAuth ? 'EXISTE' : 'NÃO EXISTE'}
              </span>
            </div>

            {result.userExistsInAuth && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.emailConfirmed)}`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.emailConfirmed)}
                  <span className="font-medium">Email Confirmado</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide">
                  {result.emailConfirmed ? 'CONFIRMADO' : 'NÃO CONFIRMADO'}
                </span>
              </div>
            )}

            <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.canLogin)}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(result.canLogin)}
                <span className="font-medium">Pode Fazer Login</span>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide">
                {result.canLogin ? 'SIM' : 'NÃO'}
              </span>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Problemas Identificados ({result.issues.length})
              </h4>
              <div className="space-y-2">
                {result.issues.map((issue, index) => (
                  <div key={index} className="flex items-start justify-between p-2 bg-white rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(issue.severity) as any} className="text-xs">
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{issue.description}</span>
                      </div>
                      <p className="text-xs text-gray-600">{issue.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Corrections applied */}
          {result.corrections.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">
                Correções Aplicadas ({result.corrections.length})
              </h4>
              <div className="space-y-2">
                {result.corrections.map((correction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {correction.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">{correction.action}</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-6">{correction.message}</p>
                    </div>
                    {correction.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(correction.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {hasCorrectableIssues && result.corrections.length === 0 && (
            <Button
              onClick={onApplyCorrections}
              disabled={fixing}
              className="w-full"
              size="lg"
            >
              {fixing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Aplicando Correções...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Aplicar Correções Automáticas
                </>
              )}
            </Button>
          )}

          {/* Client message */}
          {result.clientMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-900">
                  Mensagem para o Cliente
                </h4>
                <Button
                  onClick={copyMessage}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="bg-white p-3 rounded border text-sm whitespace-pre-line">
                {result.clientMessage}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
