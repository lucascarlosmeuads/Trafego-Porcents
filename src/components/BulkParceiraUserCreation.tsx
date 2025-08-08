import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Loader2, Users, UserCheck, UserX, Play } from 'lucide-react'

interface ClienteStatus {
  email_cliente: string
  nome_cliente: string
  has_auth_user: boolean
  created_at: string
}

interface BulkResult {
  total_processados: number
  sucessos: number
  falhas: number
  results: Array<{
    email: string
    success: boolean
    message: string
    user_id?: string
  }>
}

export function BulkParceiraUserCreation() {
  const [clientes, setClientes] = useState<ClienteStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<BulkResult | null>(null)
  const { toast } = useToast()

  const fetchClientesStatus = async () => {
    try {
      console.log('🔍 Buscando status dos clientes parceria...')
      
      // Buscar todos os clientes parceria
      const { data: clientesParceria, error: clientesError } = await supabase
        .from('clientes_parceria')
        .select('email_cliente, nome_cliente, created_at')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError)
        throw clientesError
      }

      console.log(`📊 Encontrados ${clientesParceria?.length || 0} clientes parceria`)

      // Simplificar - assumir que todos precisam de usuário Auth para processo em massa
      const clientesComStatus = (clientesParceria || []).map((cliente) => ({
        ...cliente,
        has_auth_user: false // Sempre mostrar como sem login para permitir criação em massa
      }))

      setClientes(clientesComStatus)
      console.log('✅ Status dos clientes carregado')

    } catch (error: any) {
      console.error('❌ Erro ao carregar status:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar status dos clientes",
        variant: "destructive",
      })
    }
  }

  const runBulkCreation = async () => {
    setProcessing(true)
    setLastResult(null)

    try {
      console.log('🚀 Iniciando criação em massa de usuários Auth...')

      const { data, error } = await supabase.functions.invoke('bulk-create-parceria-users')

      if (error) {
        console.error('❌ Erro na edge function:', error)
        toast({
          title: "Erro",
          description: `Falha na criação em massa: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      console.log('✅ Resultado da criação em massa:', data)
      setLastResult(data)

      if (data.sucessos > 0) {
        toast({
          title: "Sucesso!",
          description: `${data.sucessos} usuários criados com sucesso! Senha: soumilionario`,
        })
      }

      if (data.falhas > 0) {
        toast({
          title: "Atenção",
          description: `${data.falhas} falhas durante o processo. Verifique os logs.`,
          variant: "destructive",
        })
      }

      // Atualizar status após criação
      await fetchClientesStatus()

    } catch (error: any) {
      console.error('❌ Erro inesperado:', error)
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchClientesStatus().finally(() => setLoading(false))
  }, [])

  const clientesSemAuth = clientes.filter(c => !c.has_auth_user)
  const clientesComAuth = clientes.filter(c => c.has_auth_user)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando status dos clientes...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{clientes.length}</p>
              <p className="text-sm text-muted-foreground">Total Clientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{clientesComAuth.length}</p>
              <p className="text-sm text-muted-foreground">Com Login</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UserX className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{clientesSemAuth.length}</p>
              <p className="text-sm text-muted-foreground">Sem Login</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ação de Criação em Massa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Criação em Massa de Usuários Auth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta ação criará usuários Auth para todos os clientes parceria que ainda não possuem login.
            <br />
            <strong>Senha padrão:</strong> soumilionario
          </p>
          
          <Button 
            onClick={runBulkCreation}
            disabled={processing || clientesSemAuth.length === 0}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando usuários...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Criar {clientesSemAuth.length} Usuários Auth
              </>
            )}
          </Button>

          {clientesSemAuth.length === 0 && (
            <p className="text-sm text-green-600 text-center">
              ✅ Todos os clientes já possuem usuários Auth criados!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Última Execução */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Última Execução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{lastResult.total_processados}</p>
                <p className="text-sm text-muted-foreground">Processados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{lastResult.sucessos}</p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{lastResult.falhas}</p>
                <p className="text-sm text-muted-foreground">Falhas</p>
              </div>
            </div>

            {lastResult.results && lastResult.results.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-medium">Detalhes:</h4>
                {lastResult.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{result.email}</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.message}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {clientes.map((cliente) => (
              <div
                key={cliente.email_cliente}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{cliente.nome_cliente || 'Nome não informado'}</p>
                  <p className="text-sm text-muted-foreground">{cliente.email_cliente}</p>
                  <p className="text-xs text-muted-foreground">
                    Cliente desde: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge variant={cliente.has_auth_user ? "default" : "secondary"}>
                  {cliente.has_auth_user ? (
                    <>
                      <UserCheck className="mr-1 h-3 w-3" />
                      Com Login
                    </>
                  ) : (
                    <>
                      <UserX className="mr-1 h-3 w-3" />
                      Sem Login
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}