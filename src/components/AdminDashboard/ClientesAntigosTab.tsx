
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ClientesTable } from '../ClientesTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ClientesAntigosTab() {
  const { user } = useAuth()
  const [clientesAntigos, setClientesAntigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalClientes, setTotalClientes] = useState(0)

  useEffect(() => {
    fetchClientesAntigos()
  }, [])

  const fetchClientesAntigos = async () => {
    setLoading(true)
    try {
      console.log('🔍 [ClientesAntigosTab] Buscando clientes antigos...')
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('origem_cadastro', 'admin')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [ClientesAntigosTab] Erro ao buscar clientes antigos:', error)
        return
      }

      console.log('✅ [ClientesAntigosTab] Clientes antigos encontrados:', data?.length || 0)
      setClientesAntigos(data || [])
      setTotalClientes(data?.length || 0)
    } catch (error) {
      console.error('💥 [ClientesAntigosTab] Erro crítico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchClientesAntigos()
  }

  const getOldestClient = () => {
    if (clientesAntigos.length === 0) return null
    
    return clientesAntigos.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.data_cadastro_desejada || oldest.created_at)
      const currentDate = new Date(current.data_cadastro_desejada || current.created_at)
      return currentDate < oldestDate ? current : oldest
    })
  }

  const oldestClient = getOldestClient()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Carregando clientes antigos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Clientes Antigos</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalClientes}</div>
            <p className="text-xs text-gray-400">
              Não contabilizados nas métricas de vendas
            </p>
          </CardContent>
        </Card>

        {oldestClient && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Cliente Mais Antigo</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white truncate">{oldestClient.nome_cliente}</div>
              <p className="text-xs text-gray-400">
                {format(
                  new Date(oldestClient.data_cadastro_desejada || oldestClient.created_at), 
                  "dd/MM/yyyy 'às' HH:mm", 
                  { locale: ptBR }
                )}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Informação</CardTitle>
            <Info className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-white">Clientes de Histórico</div>
            <p className="text-xs text-gray-400">
              Utilizados para organização interna
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">Sobre Clientes Antigos</h3>
            <p className="text-sm text-blue-200">
              Esta seção mostra clientes adicionados pelo administrador que <strong>não contam como vendas novas</strong>. 
              Eles são úteis para organização de dados históricos, migração de sistemas antigos ou testes, 
              mas não aparecem nas métricas de performance de vendas do dashboard principal.
            </p>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      {totalClientes > 0 ? (
        <ClientesTable 
          customClientes={clientesAntigos}
          showOrigemFilter={false}
          onRefresh={handleRefresh}
          title="Clientes Antigos"
        />
      ) : (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum Cliente Antigo</h3>
            <p className="text-gray-400 text-center max-w-md">
              Ainda não existem clientes marcados como "antigos" no sistema. 
              Use o botão "Adicionar Cliente" e marque a opção correspondente para adicionar clientes históricos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
