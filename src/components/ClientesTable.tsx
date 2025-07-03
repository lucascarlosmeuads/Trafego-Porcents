
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Search } from 'lucide-react'

interface ClientesTableProps {
  selectedManager?: string | null
  onManagerSelect?: (manager: string | null) => void
  customClientes?: any[]
  showOrigemFilter?: boolean
  onRefresh?: () => void
  title?: string
}

export function ClientesTable({ 
  selectedManager, 
  onManagerSelect, 
  customClientes,
  showOrigemFilter = true,
  onRefresh,
  title = "Tabela de Clientes"
}: ClientesTableProps) {
  const { isAdmin } = useAuth()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!customClientes) {
      fetchClientes()
    } else {
      setClientes(customClientes)
      setLoading(false)
    }
  }, [customClientes, selectedManager])

  const fetchClientes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter by origem if showOrigemFilter is true
      if (showOrigemFilter) {
        query = query.or('origem_cadastro.is.null,origem_cadastro.eq.venda')
      }

      if (selectedManager && selectedManager !== 'Todos os Gestores' && selectedManager !== 'Todos os Clientes') {
        query = query.eq('email_gestor', selectedManager)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [ClientesTable] Erro ao buscar clientes:', error)
        return
      }

      setClientes(data || [])
    } catch (error) {
      console.error('💥 [ClientesTable] Erro crítico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      fetchClientes()
    }
  }

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = !searchTerm || 
      cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || cliente.status_campanha === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-gray-700 hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="Aguardando briefing">Aguardando briefing</SelectItem>
                <SelectItem value="Briefing em análise">Briefing em análise</SelectItem>
                <SelectItem value="Criativo em produção">Criativo em produção</SelectItem>
                <SelectItem value="Aguardando aprovação">Aguardando aprovação</SelectItem>
                <SelectItem value="Campanha ativa">Campanha ativa</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Header Info */}
          <div className="text-white">
            <h3 className="text-lg font-semibold">
              {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} encontrado{filteredClientes.length !== 1 ? 's' : ''}
            </h3>
            {selectedManager && selectedManager !== 'Todos os Gestores' && selectedManager !== 'Todos os Clientes' && (
              <p className="text-gray-400 text-sm">Gestor: {selectedManager}</p>
            )}
          </div>

          {/* Simple Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2 text-gray-300">Nome</th>
                  <th className="text-left p-2 text-gray-300">Email</th>
                  <th className="text-left p-2 text-gray-300">Status</th>
                  <th className="text-left p-2 text-gray-300">Data Cadastro</th>
                  <th className="text-left p-2 text-gray-300">Origem</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-2 text-white">{cliente.nome_cliente || 'N/A'}</td>
                    <td className="p-2 text-gray-300">{cliente.email_cliente || 'N/A'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        cliente.status_campanha === 'Concluído' ? 'bg-green-900 text-green-300' :
                        cliente.status_campanha === 'Campanha ativa' ? 'bg-blue-900 text-blue-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {cliente.status_campanha || 'Novo'}
                      </span>
                    </td>
                    <td className="p-2 text-gray-300">
                      {cliente.data_cadastro_desejada 
                        ? new Date(cliente.data_cadastro_desejada).toLocaleDateString('pt-BR')
                        : new Date(cliente.created_at).toLocaleDateString('pt-BR')
                      }
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        cliente.origem_cadastro === 'admin' 
                          ? 'bg-purple-900 text-purple-300' 
                          : 'bg-green-900 text-green-300'
                      }`}>
                        {cliente.origem_cadastro === 'admin' ? 'Admin' : 'Venda'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm || statusFilter ? 'Nenhum cliente encontrado com os filtros aplicados' : 'Nenhum cliente encontrado'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientesTable
