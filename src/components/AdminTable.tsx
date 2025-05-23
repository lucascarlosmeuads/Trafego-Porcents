
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

export function AdminTable() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
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
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Carregando dados...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Clientes ({clientes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Data Venda</TableHead>
                <TableHead>Nome Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Email Gestor</TableHead>
                <TableHead>Status Campanha</TableHead>
                <TableHead>Data Limite</TableHead>
                <TableHead>Data Subida</TableHead>
                <TableHead>Link Grupo</TableHead>
                <TableHead>Link Briefing</TableHead>
                <TableHead>Link Criativo</TableHead>
                <TableHead>Link Site</TableHead>
                <TableHead>Número BM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-mono text-xs">{cliente.id}</TableCell>
                  <TableCell>{formatDate(cliente.data_venda)}</TableCell>
                  <TableCell>{cliente.nome_cliente}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{cliente.email_cliente}</TableCell>
                  <TableCell>{cliente.nome_vendedor}</TableCell>
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
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center"
                        onClick={() => setEditingCell(`${cliente.id}-comissao`)}
                      >
                        {saving === `${cliente.id}-comissao` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          cliente.comissao || '-'
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{cliente.email_gestor_responsavel}</TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-status_campanha` ? (
                      <Select 
                        defaultValue={cliente.status_campanha || ''}
                        onValueChange={(value) => handleCellEdit(cliente.id, 'status_campanha', value)}
                      >
                        <SelectTrigger className="h-8">
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
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center"
                        onClick={() => setEditingCell(`${cliente.id}-status_campanha`)}
                      >
                        {saving === `${cliente.id}-status_campanha` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
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
                  <TableCell>{cliente.data_limite || '-'}</TableCell>
                  <TableCell>{formatDate(cliente.data_subida_campanha)}</TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-link_grupo` ? (
                      <Input
                        defaultValue={cliente.link_grupo || ''}
                        onBlur={(e) => handleCellEdit(cliente.id, 'link_grupo', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(cliente.id, 'link_grupo', e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null)
                          }
                        }}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center max-w-[200px]"
                        onClick={() => setEditingCell(`${cliente.id}-link_grupo`)}
                      >
                        {saving === `${cliente.id}-link_grupo` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="truncate">
                            {cliente.link_grupo || '-'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-link_reuniao_1` ? (
                      <Input
                        defaultValue={cliente.link_reuniao_1 || ''}
                        onBlur={(e) => handleCellEdit(cliente.id, 'link_reuniao_1', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(cliente.id, 'link_reuniao_1', e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null)
                          }
                        }}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center max-w-[200px]"
                        onClick={() => setEditingCell(`${cliente.id}-link_reuniao_1`)}
                      >
                        {saving === `${cliente.id}-link_reuniao_1` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="truncate">
                            {cliente.link_reuniao_1 || '-'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-link_reuniao_2` ? (
                      <Input
                        defaultValue={cliente.link_reuniao_2 || ''}
                        onBlur={(e) => handleCellEdit(cliente.id, 'link_reuniao_2', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(cliente.id, 'link_reuniao_2', e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null)
                          }
                        }}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center max-w-[200px]"
                        onClick={() => setEditingCell(`${cliente.id}-link_reuniao_2`)}
                      >
                        {saving === `${cliente.id}-link_reuniao_2` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="truncate">
                            {cliente.link_reuniao_2 || '-'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-link_reuniao_3` ? (
                      <Input
                        defaultValue={cliente.link_reuniao_3 || ''}
                        onBlur={(e) => handleCellEdit(cliente.id, 'link_reuniao_3', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(cliente.id, 'link_reuniao_3', e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null)
                          }
                        }}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center max-w-[200px]"
                        onClick={() => setEditingCell(`${cliente.id}-link_reuniao_3`)}
                      >
                        {saving === `${cliente.id}-link_reuniao_3` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="truncate">
                            {cliente.link_reuniao_3 || '-'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-bm_identificacao` ? (
                      <Input
                        defaultValue={cliente.bm_identificacao || ''}
                        onBlur={(e) => handleCellEdit(cliente.id, 'bm_identificacao', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(cliente.id, 'bm_identificacao', e.currentTarget.value)
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null)
                          }
                        }}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[24px] flex items-center"
                        onClick={() => setEditingCell(`${cliente.id}-bm_identificacao`)}
                      >
                        {saving === `${cliente.id}-bm_identificacao` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          cliente.bm_identificacao || '-'
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {clientes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
