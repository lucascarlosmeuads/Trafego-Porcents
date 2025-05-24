import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const { toast } = useToast()

  useEffect(() => {
    fetchAllClientes()
  }, [])

  const fetchAllClientes = async () => {
    console.log('Carregando todos os clientes...')
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: `Erro ao carregar dados: ${error.message}`,
          variant: "destructive"
        })
      } else {
        console.log('Dados carregados:', data?.length || 0, 'registros')
        setClientes(data || [])
      }
    } catch (error) {
      console.error('Erro na consulta:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = async (id: string, field: keyof Cliente, value: string) => {
    setSaving(`${id}-${field}`)
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar:', error)
        toast({
          title: "Erro",
          description: `Erro ao salvar: ${error.message}`,
          variant: "destructive"
        })
      } else {
        // Atualizar o estado local
        setClientes(prev => prev.map(cliente => 
          cliente.id === id ? { ...cliente, [field]: value } : cliente
        ))
        toast({
          title: "Sucesso",
          description: "Campo atualizado com sucesso"
        })
      }
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      })
    } finally {
      setSaving(null)
      setEditingCell(null)
    }
  }

  const handleCellEdit = (id: string, field: keyof Cliente, value: string) => {
    updateField(id, field, value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span>Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl">
            Todos os Clientes ({clientes.length})
          </CardTitle>
          <Button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            variant="outline"
            size="sm"
            className="lg:hidden"
          >
            {viewMode === 'table' ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
            {viewMode === 'table' ? 'Cartões' : 'Tabela'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Visualização em cartões para mobile */}
        {viewMode === 'cards' && (
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
            {clientes.map((cliente) => (
              <Card key={cliente.id} className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate">{cliente.nome_cliente || 'Cliente sem nome'}</span>
                    <span className="text-xs font-mono text-gray-500">#{cliente.id}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Telefone:</span>
                    <span className="ml-2">{cliente.telefone || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Vendedor:</span>
                    <span className="ml-2">{cliente.nome_vendedor || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      cliente.status_campanha === 'Planejamento' ? 'bg-blue-100 text-blue-800' :
                      cliente.status_campanha === 'Brief' ? 'bg-yellow-100 text-yellow-800' :
                      cliente.status_campanha === 'Criativo' ? 'bg-purple-100 text-purple-800' :
                      cliente.status_campanha === 'No Ar' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cliente.status_campanha || 'Sem Status'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Comissão:</span>
                    <span className="ml-2">{cliente.comissao || '-'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabela para desktop */}
        <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'} overflow-x-auto`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead className="min-w-[100px]">Data Venda</TableHead>
                <TableHead className="min-w-[200px]">Nome Cliente</TableHead>
                <TableHead className="min-w-[120px] hidden sm:table-cell">Telefone</TableHead>
                <TableHead className="min-w-[200px] hidden md:table-cell">Email Cliente</TableHead>
                <TableHead className="min-w-[150px]">Vendedor</TableHead>
                <TableHead className="min-w-[100px]">Comissão</TableHead>
                <TableHead className="min-w-[180px] hidden lg:table-cell">Email Gestor</TableHead>
                <TableHead className="min-w-[130px]">Status Campanha</TableHead>
                <TableHead className="min-w-[100px] hidden xl:table-cell">Data Limite</TableHead>
                <TableHead className="min-w-[100px] hidden xl:table-cell">Data Subida</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell">Link Grupo</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell">Link Briefing</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell">Link Criativo</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell">Link Site</TableHead>
                <TableHead className="min-w-[120px] hidden xl:table-cell">Número BM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-mono text-xs">{cliente.id}</TableCell>
                  <TableCell className="text-xs">{formatDate(cliente.data_venda)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate">
                      {cliente.nome_cliente}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{cliente.telefone}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-[200px] truncate">
                      {cliente.email_cliente}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate">
                      {cliente.nome_vendedor}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-comissao` ? (
                      <Input
                        defaultValue={cliente.comissao || ''}
                        onBlur={(e) => handleCellEdit(cliente.id, 'comissao', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(cliente.id, 'comissao', e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null)
                          }
                        }}
                        className="h-8 w-20"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center w-20"
                        onClick={() => setEditingCell(`${cliente.id}-comissao`)}
                      >
                        {saving === `${cliente.id}-comissao` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="truncate">{cliente.comissao || '-'}</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="max-w-[180px] truncate">
                      {cliente.email_gestor_responsavel}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-status_campanha` ? (
                      <Select 
                        defaultValue={cliente.status_campanha || ''}
                        onValueChange={(value) => handleCellEdit(cliente.id, 'status_campanha', value)}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planejamento">Planejamento</SelectItem>
                          <SelectItem value="Brief">Brief</SelectItem>
                          <SelectItem value="Criativo">Criativo</SelectItem>
                          <SelectItem value="No Ar">No Ar</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center w-32"
                        onClick={() => setEditingCell(`${cliente.id}-status_campanha`)}
                      >
                        {saving === `${cliente.id}-status_campanha` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium truncate ${
                            cliente.status_campanha === 'Planejamento' ? 'bg-blue-100 text-blue-800' :
                            cliente.status_campanha === 'Brief' ? 'bg-yellow-100 text-yellow-800' :
                            cliente.status_campanha === 'Criativo' ? 'bg-purple-100 text-purple-800' :
                            cliente.status_campanha === 'No Ar' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {cliente.status_campanha || 'Sem Status'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Campos ocultos em telas menores */}
                  <TableCell className="hidden xl:table-cell">{cliente.data_limite || '-'}</TableCell>
                  <TableCell className="hidden xl:table-cell">{formatDate(cliente.data_subida_campanha)}</TableCell>
                  
                  {/* Links ocultos em telas menores */}
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate">
                      {cliente.link_grupo || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate">
                      {cliente.link_reuniao_1 || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate">
                      {cliente.link_reuniao_2 || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate">
                      {cliente.link_reuniao_3 || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">{cliente.bm_identificacao || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {clientes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
