import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit, Save, X, DollarSign } from 'lucide-react'
import { supabase, type VendasCliente } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/utils/currencyUtils'

export function VendasManager() {
  const { user } = useAuth()
  const [vendas, setVendas] = useState<VendasCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVenda, setNewVenda] = useState({
    produto_vendido: '',
    valor_venda: 0,
    data_venda: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  useEffect(() => {
    fetchVendas()
  }, [user])

  const fetchVendas = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', user.email)
        .order('data_venda', { ascending: false })

      if (error) {
        console.error('Erro ao buscar vendas:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar vendas",
          variant: "destructive"
        })
        return
      }

      setVendas(data || [])
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddVenda = async () => {
    if (!user?.email) return

    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .insert({
          ...newVenda,
          email_cliente: user.email
        })

      if (error) {
        console.error('Erro ao adicionar venda:', error)
        toast({
          title: "Erro",
          description: "Erro ao adicionar venda",
          variant: "destructive"
        })
        return
      }

      setNewVenda({
        produto_vendido: '',
        valor_venda: 0,
        data_venda: new Date().toISOString().split('T')[0],
        observacoes: ''
      })
      setShowAddForm(false)
      fetchVendas()
      toast({
        title: "Sucesso",
        description: "Venda adicionada com sucesso"
      })
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar venda",
        variant: "destructive"
      })
    }
  }

  const handleUpdateVenda = async (id: string, updatedVenda: VendasCliente) => {
    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .update(updatedVenda)
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar venda:', error)
        toast({
          title: "Erro",
          description: "Erro ao atualizar venda",
          variant: "destructive"
        })
        return
      }

      setEditingId(null)
      fetchVendas()
      toast({
        title: "Sucesso",
        description: "Venda atualizada com sucesso"
      })
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar venda",
        variant: "destructive"
      })
    }
  }

  const handleDeleteVenda = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendas_cliente')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar venda:', error)
        toast({
          title: "Erro",
          description: "Erro ao deletar venda",
          variant: "destructive"
        })
        return
      }

      fetchVendas()
      toast({
        title: "Sucesso",
        description: "Venda deletada com sucesso"
      })
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar venda",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'Data inválida'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Suas Vendas
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchVendas}
            disabled={loading}
            className="ml-auto"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Atualizando...
              </div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botão para adicionar venda */}
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Venda
        </Button>

        {/* Formulário de adicionar venda */}
        {showAddForm && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Nova Venda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="produto_vendido">Produto Vendido</Label>
                <Input
                  id="produto_vendido"
                  value={newVenda.produto_vendido}
                  onChange={(e) =>
                    setNewVenda({ ...newVenda, produto_vendido: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="valor_venda">Valor da Venda</Label>
                <Input
                  id="valor_venda"
                  type="number"
                  value={newVenda.valor_venda}
                  onChange={(e) =>
                    setNewVenda({
                      ...newVenda,
                      valor_venda: parseFloat(e.target.value)
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="data_venda">Data da Venda</Label>
                <Input
                  id="data_venda"
                  type="date"
                  value={newVenda.data_venda}
                  onChange={(e) =>
                    setNewVenda({ ...newVenda, data_venda: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={newVenda.observacoes}
                  onChange={(e) =>
                    setNewVenda({ ...newVenda, observacoes: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddVenda}>Adicionar</Button>
            </div>
          </div>
        )}

        {/* Tabela de vendas */}
        {vendas.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto Vendido</TableHead>
                  <TableHead>Valor da Venda</TableHead>
                  <TableHead>Data da Venda</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((venda) => (
                  <TableRow key={venda.id}>
                    {editingId === venda.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={venda.produto_vendido}
                            onChange={(e) =>
                              setVendas((prev) =>
                                prev.map((v) =>
                                  v.id === venda.id
                                    ? { ...v, produto_vendido: e.target.value }
                                    : v
                                )
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={venda.valor_venda}
                            onChange={(e) =>
                              setVendas((prev) =>
                                prev.map((v) =>
                                  v.id === venda.id
                                    ? {
                                        ...v,
                                        valor_venda: parseFloat(e.target.value)
                                      }
                                    : v
                                )
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={venda.data_venda}
                            onChange={(e) =>
                              setVendas((prev) =>
                                prev.map((v) =>
                                  v.id === venda.id
                                    ? { ...v, data_venda: e.target.value }
                                    : v
                                )
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={venda.observacoes}
                            onChange={(e) =>
                              setVendas((prev) =>
                                prev.map((v) =>
                                  v.id === venda.id
                                    ? { ...v, observacoes: e.target.value }
                                    : v
                                )
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                handleUpdateVenda(venda.id, venda)
                              }}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{venda.produto_vendido}</TableCell>
                        <TableCell>{formatCurrency(venda.valor_venda)}</TableCell>
                        <TableCell>{formatDate(venda.data_venda)}</TableCell>
                        <TableCell>{venda.observacoes}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(venda.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteVenda(venda.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma venda encontrada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
