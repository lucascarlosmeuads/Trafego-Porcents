
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
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-foreground">Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl text-card-foreground">
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
              <Card key={cliente.id} className="w-full bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between text-card-foreground">
                    <span className="truncate">{cliente.nome_cliente || 'Cliente sem nome'}</span>
                    <span className="text-xs font-mono text-muted-foreground">#{cliente.id}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Telefone:</span>
                    <span className="ml-2 text-card-foreground">{cliente.telefone || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Vendedor:</span>
                    <span className="ml-2 text-card-foreground">{cliente.nome_vendedor || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      cliente.status_campanha === 'Planejamento' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      cliente.status_campanha === 'Brief' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      cliente.status_campanha === 'Criativo' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      cliente.status_campanha === 'No Ar' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {cliente.status_campanha || 'Sem Status'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Comissão:</span>
                    <span className="ml-2 text-card-foreground">{cliente.comissao || '-'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabela para desktop */}
        <div className={`${viewMode === 'cards' ? 'hidden lg:block' : 'block'} overflow-x-auto`}>
          <Table className="table-dark">
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/20">
                <TableHead className="w-20 text-muted-foreground">ID</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Data Venda</TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground">Nome Cliente</TableHead>
                <TableHead className="min-w-[120px] hidden sm:table-cell text-muted-foreground">Telefone</TableHead>
                <TableHead className="min-w-[200px] hidden md:table-cell text-muted-foreground">Email Cliente</TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground">Vendedor</TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground">Comissão</TableHead>
                <TableHead className="min-w-[180px] hidden lg:table-cell text-muted-foreground">Email Gestor</TableHead>
                <TableHead className="min-w-[130px] text-muted-foreground">Status Campanha</TableHead>
                <TableHead className="min-w-[100px] hidden xl:table-cell text-muted-foreground">Data Limite</TableHead>
                <TableHead className="min-w-[100px] hidden xl:table-cell text-muted-foreground">Data Subida</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Grupo</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Briefing</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Criativo</TableHead>
                <TableHead className="min-w-[200px] hidden xl:table-cell text-muted-foreground">Link Site</TableHead>
                <TableHead className="min-w-[120px] hidden xl:table-cell text-muted-foreground">Número BM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id} className="border-border hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs text-foreground">{cliente.id}</TableCell>
                  <TableCell className="text-xs text-foreground">{formatDate(cliente.data_venda)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.nome_cliente}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-foreground">{cliente.telefone}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.email_cliente}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate text-foreground">
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
                        className="h-8 w-20 bg-background border-border text-foreground"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="editable-cell cursor-pointer p-1 rounded min-h-[24px] flex items-center w-20"
                        onClick={() => setEditingCell(`${cliente.id}-comissao`)}
                      >
                        {saving === `${cliente.id}-comissao` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="truncate text-foreground">{cliente.comissao || '-'}</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="max-w-[180px] truncate text-foreground">
                      {cliente.email_gestor_responsavel}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingCell === `${cliente.id}-status_campanha` ? (
                      <Select 
                        defaultValue={cliente.status_campanha || ''}
                        onValueChange={(value) => handleCellEdit(cliente.id, 'status_campanha', value)}
                      >
                        <SelectTrigger className="h-8 w-32 bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Planejamento">Planejamento</SelectItem>
                          <SelectItem value="Brief">Brief</SelectItem>
                          <SelectItem value="Criativo">Criativo</SelectItem>
                          <SelectItem value="No Ar">No Ar</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div 
                        className="editable-cell cursor-pointer p-1 rounded min-h-[24px] flex items-center w-32"
                        onClick={() => setEditingCell(`${cliente.id}-status_campanha`)}
                      >
                        {saving === `${cliente.id}-status_campanha` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium truncate ${
                            cliente.status_campanha === 'Planejamento' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            cliente.status_campanha === 'Brief' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            cliente.status_campanha === 'Criativo' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            cliente.status_campanha === 'No Ar' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {cliente.status_campanha || 'Sem Status'}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Campos ocultos em telas menores */}
                  <TableCell className="hidden xl:table-cell text-foreground">{cliente.data_limite || '-'}</TableCell>
                  <TableCell className="hidden xl:table-cell text-foreground">{formatDate(cliente.data_subida_campanha)}</TableCell>
                  
                  {/* Links ocultos em telas menores */}
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.link_grupo || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.link_reuniao_1 || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.link_reuniao_2 || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="max-w-[200px] truncate text-foreground">
                      {cliente.link_reuniao_3 || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-foreground">{cliente.bm_identificacao || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {clientes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
