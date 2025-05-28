
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stethoscope, AlertTriangle } from 'lucide-react'
import { useAdvancedAuthDiagnostic } from '@/hooks/useAdvancedAuthDiagnostic'
import { DiagnosticProgress } from '@/components/AuthDiagnostic/DiagnosticProgress'
import { DiagnosticResult } from '@/components/AuthDiagnostic/DiagnosticResult'

export function ClientAuthDiagnostic() {
  const [email, setEmail] = useState('')
  const { 
    loading, 
    fixing, 
    progress, 
    result, 
    runCompleteDiagnostic, 
    applyCorrections 
  } = useAdvancedAuthDiagnostic()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      runCompleteDiagnostic(email)
    }
  }

  const handleApplyCorrections = () => {
    if (result) {
      applyCorrections(result)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Stethoscope className="w-5 h-5" />
            Diagnóstico Avançado de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Sistema Completo de Correção</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Diagnóstico completo em tempo real</li>
              <li>🔧 Correções automáticas para 99% dos problemas</li>
              <li>📱 Mensagem pronta para enviar ao cliente</li>
              <li>🎯 Resolve: usuário inexistente, senha errada, email não confirmado</li>
              <li>📊 Detecta e reporta duplicatas na base</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email do Cliente</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                disabled={loading || fixing}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim() || fixing}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
                  Executando Diagnóstico Completo...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Executar Diagnóstico Avançado
                </>
              )}
            </Button>
          </form>

          {progress && (
            <DiagnosticProgress progress={progress} />
          )}

          {result && (
            <DiagnosticResult 
              result={result} 
              onApplyCorrections={handleApplyCorrections}
              fixing={fixing}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
