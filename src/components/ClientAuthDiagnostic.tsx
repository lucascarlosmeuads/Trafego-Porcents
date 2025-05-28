
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DiagnosticResult {
  email: string
  clienteExistsInDatabase: boolean
  userExistsInAuth: boolean
  canLogin: boolean
  issue: string | null
  solution: string | null
}

export function ClientAuthDiagnostic() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const { toast } = useToast()

  const runDiagnostic = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email para diagnosticar",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    console.log('🔍 [AuthDiagnostic] Iniciando diagnóstico para:', email)

    try {
      const normalizedEmail = email.toLowerCase().trim()
      
      // 1. Verificar se existe na tabela todos_clientes
      const { data: cliente, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, email_cliente')
        .eq('email_cliente', normalizedEmail)
        .single()

      console.log('🔍 [AuthDiagnostic] Cliente na base:', cliente)

      // 2. Tentar fazer login de teste para verificar autenticação
      let canLogin = false
      let authError = null
      
      try {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: 'parceriadesucesso'
        })
        
        if (!loginError) {
          canLogin = true
          // Fazer logout imediatamente após teste
          await supabase.auth.signOut()
        } else {
          authError = loginError.message
        }
      } catch (error) {
        authError = error instanceof Error ? error.message : 'Erro desconhecido'
      }

      console.log('🔍 [AuthDiagnostic] Pode fazer login:', canLogin)
      console.log('🔍 [AuthDiagnostic] Erro de auth:', authError)

      // 3. Analisar o resultado e determinar o problema
      let issue = null
      let solution = null

      if (!cliente) {
        issue = 'Cliente não encontrado na base de dados'
        solution = 'Cadastrar o cliente na tabela todos_clientes'
      } else if (!canLogin) {
        if (authError?.includes('Invalid login credentials')) {
          issue = 'Usuário existe mas senha está incorreta'
          solution = 'Resetar senha para "parceriadesucesso"'
        } else if (authError?.includes('Email not confirmed')) {
          issue = 'Email não confirmado no Supabase Auth'
          solution = 'Confirmar email ou recriar usuário'
        } else {
          issue = 'Problema de autenticação desconhecido'
          solution = 'Verificar logs do Supabase ou recriar usuário'
        }
      }

      const diagnosticResult: DiagnosticResult = {
        email: normalizedEmail,
        clienteExistsInDatabase: !!cliente,
        userExistsInAuth: authError !== null || canLogin, // Se teve erro ou conseguiu logar, usuário existe
        canLogin,
        issue,
        solution
      }

      setResult(diagnosticResult)
      console.log('🔍 [AuthDiagnostic] Resultado:', diagnosticResult)

    } catch (error) {
      console.error('❌ [AuthDiagnostic] Erro:', error)
      toast({
        title: "Erro no Diagnóstico",
        description: "Erro ao verificar cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fixAuthIssue = async () => {
    if (!result) return

    setFixing(true)
    console.log('🔧 [AuthDiagnostic] Iniciando correção para:', result.email)

    try {
      const { data, error } = await supabase.functions.invoke('fix-client-auth', {
        body: { email: result.email }
      })

      if (error) {
        console.error('❌ [AuthDiagnostic] Erro na correção:', error)
        toast({
          title: "Erro na Correção",
          description: `Erro: ${error.message}`,
          variant: "destructive"
        })
        return
      }

      console.log('✅ [AuthDiagnostic] Correção executada:', data)
      
      toast({
        title: "Correção Aplicada",
        description: data.message || "Cliente corrigido com sucesso"
      })

      // Executar diagnóstico novamente para verificar se foi corrigido
      setTimeout(() => {
        runDiagnostic()
      }, 1000)

    } catch (error) {
      console.error('💥 [AuthDiagnostic] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao corrigir cliente",
        variant: "destructive"
      })
    } finally {
      setFixing(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <UserCheck className="w-5 h-5" />
            Diagnóstico de Autenticação de Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Como usar:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Digite o email do cliente com problema de login</li>
              <li>• Execute o diagnóstico para identificar o problema</li>
              <li>• Use a correção automática se disponível</li>
              <li>• Verifique se o problema foi resolvido</li>
            </ul>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email do Cliente</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              onKeyDown={(e) => e.key === 'Enter' && runDiagnostic()}
            />
          </div>

          <Button
            onClick={runDiagnostic}
            disabled={loading || !email.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Diagnosticando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Executar Diagnóstico
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-card-foreground">
                    Resultado para: {result.email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.clienteExistsInDatabase)}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.clienteExistsInDatabase)}
                      <span className="font-medium">Cliente na Base de Dados</span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {result.clienteExistsInDatabase ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.userExistsInAuth)}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.userExistsInAuth)}
                      <span className="font-medium">Usuário no Supabase Auth</span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {result.userExistsInAuth ? 'EXISTE' : 'NÃO EXISTE'}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.canLogin)}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.canLogin)}
                      <span className="font-medium">Pode Fazer Login</span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {result.canLogin ? 'SIM' : 'NÃO'}
                    </span>
                  </div>

                  {result.issue && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Problema Identificado:</h4>
                      <p className="text-sm text-red-800">{result.issue}</p>
                    </div>
                  )}

                  {result.solution && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Solução Recomendada:</h4>
                      <p className="text-sm text-blue-800">{result.solution}</p>
                    </div>
                  )}

                  {result.issue && result.solution && (
                    <Button
                      onClick={fixAuthIssue}
                      disabled={fixing}
                      className="w-full"
                      variant="default"
                    >
                      {fixing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Aplicando Correção...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Aplicar Correção Automática
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
