
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Download, Search, Filter } from 'lucide-react'

const statusOptions = ['Planejamento', 'Brief', 'Criativo', 'No Ar']

export function ClientesTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null)
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [user])

  useEffect(() => {
    filterClientes()
  }, [clientes, searchTerm, statusFilter])

  const fetchClientes = async () => {
    if (!user) return

    try {
      let query = supabase.from('clientes').select('*')
      
      if (!isAdmin) {
        // Update to use email_gestor_responsavel which exists in the database
        query = query.eq('email_gestor_responsavel', user.email)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive"
        })
      } else {
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterClientes = () => {
    let filtered = clientes

    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        (cliente.nome_cliente || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Modified to ignore 'all' value as requested
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(cliente => cliente.status_campanha === statusFilter)
    }

    setFilteredClientes(filtered)
  }

  const updateField = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        throw error
      }

      setClientes(prev => prev.map(cliente => 
        cliente.id === id ? { ...cliente, [field]: value } : cliente
      ))

      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso"
      })
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o campo",
        variant: "destructive"
      })
    }
  }

  const exportToCSV = () => {
    const headers = [
      'ID', 'Data Venda', 'Nome Cliente', 'Telefone', 'Email Cliente', 
      'Vendedor', 'Email Gestor', 'Status Campanha',
      'Link Grupo', 'Link Briefing', 'Link Criativo', 'Link Site', 'Número BM'
    ]

    const csvData = filteredClientes.map(cliente => [
      cliente.id,
      cliente.data_venda || '',
      cliente.nome_cliente || '',
      cliente.telefone || '',
      cliente.email_cliente || '',
      cliente.nome_vendedor || '',
      cliente.email_gestor_responsavel || '',
      cliente.status_campanha || '',
      cliente.link_grupo || '',
      cliente.link_reuniao_1 || '', // Changed from link_briefing to match database
      cliente.link_reuniao_2 || '', // Changed from link_criativo to match database
      cliente.link_reuniao_3 || '', // Changed from link_site to match database
      cliente.bm_identificacao || '' // Changed from numero_bm to match database
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Dados exportados com sucesso"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clientes</span>
          <Button onClick={exportToCSV} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar por nome do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Data Venda</th>
                <th className="p-3 text-left">Nome Cliente</th>
                <th className="p-3 text-left">Telefone</th>
                <th className="p-3 text-left">Status Campanha</th>
                <th className="p-3 text-left">Link Grupo</th>
                <th className="p-3 text-left">Link Reunião 1</th>
                <th className="p-3 text-left">Link Reunião 2</th>
                <th className="p-3 text-left">Link Reunião 3</th>
                <th className="p-3 text-left">BM Identificação</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{cliente.data_venda ? new Date(cliente.data_venda).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-3 font-medium">{cliente.nome_cliente || '-'}</td>
                  <td className="p-3">{cliente.telefone || '-'}</td>
                  <td className="p-3">
                    {editingCell?.id === cliente.id && editingCell?.field === 'status_campanha' ? (
                      <Select
                        value={cliente.status_campanha || ''}
                        onValueChange={(value) => {
                          updateField(cliente.id, 'status_campanha', value)
                          setEditingCell(null)
                        }}
                        onOpenChange={(open) => !open && setEditingCell(null)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCell({id: cliente.id, field: 'status_campanha'})}
                        className="h-auto p-1 font-normal justify-start"
                      >
                        {cliente.status_campanha || 'Clique para editar'}
                      </Button>
                    )}
                  </td>
                  {/* Updated field names to match the database schema */}
                  {['link_grupo', 'link_reuniao_1', 'link_reuniao_2', 'link_reuniao_3', 'bm_identificacao'].map(field => (
                    <td key={field} className="p-3">
                      {editingCell?.id === cliente.id && editingCell?.field === field ? (
                        <Input
                          value={(cliente[field as keyof typeof cliente] as string) || ''}
                          onChange={(e) => updateField(cliente.id, field, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingCell(null)}
                          autoFocus
                          className="w-32"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCell({id: cliente.id, field})}
                          className="h-auto p-1 font-normal justify-start text-blue-600"
                        >
                          {(cliente[field as keyof typeof cliente] as string) || 'Clique para editar'}
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
