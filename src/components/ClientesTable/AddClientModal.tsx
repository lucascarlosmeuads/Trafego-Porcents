
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Plus, Loader2 } from 'lucide-react'
import { useClienteAdd } from '@/hooks/useClienteAdd'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface AddClientModalProps {
  selectedManager: string
  onClienteAdicionado: () => void // Add missing prop
  gestorMode?: boolean
}

export function AddClientModal({ selectedManager, onClienteAdicionado, gestorMode = false }: AddClientModalProps) {
  const { user, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    vendedor: '',
    email_gestor: selectedManager,
    data_venda: new Date().toISOString().split('T')[0],
    valor_venda_inicial: 0 // Add valor_venda_inicial to form
  })

  const { addCliente } = useClienteAdd(user?.email || '', isAdmin, onClienteAdicionado)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome_cliente || !formData.telefone || !formData.email_cliente || !formData.vendedor || !formData.valor_venda_inicial) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const result = await addCliente(formData)
      
      if (result.success) {
        setOpen(false)
        setFormData({
          nome_cliente: '',
          telefone: '',
          email_cliente: '',
          vendedor: '',
          email_gestor: selectedManager,
          data_venda: new Date().toISOString().split('T')[0],
          valor_venda_inicial: 0
        })
        toast({
          title: "Sucesso!",
          description: "Cliente adicionado com sucesso",
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email_cliente">Email do Cliente *</Label>
            <Input
              id="email_cliente"
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
              placeholder="cliente@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="vendedor">Vendedor *</Label>
            <Input
              id="vendedor"
              value={formData.vendedor}
              onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
              placeholder="Nome do vendedor"
              required
            />
          </div>

          <div>
            <Label htmlFor="valor_venda_inicial">💰 Valor da Venda (R$) *</Label>
            <CurrencyInput
              id="valor_venda_inicial"
              value={formData.valor_venda_inicial}
              onChange={(value) => setFormData({ ...formData, valor_venda_inicial: value })}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="email_gestor">Email do Gestor</Label>
            <Input
              id="email_gestor"
              value={formData.email_gestor}
              onChange={(e) => setFormData({ ...formData, email_gestor: e.target.value })}
              placeholder="gestor@email.com"
              disabled={gestorMode}
            />
          </div>

          <div>
            <Label htmlFor="data_venda">Data da Venda</Label>
            <Input
              id="data_venda"
              type="date"
              value={formData.data_venda}
              onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
