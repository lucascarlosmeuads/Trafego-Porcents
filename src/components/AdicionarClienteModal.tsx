
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { ensureClienteExists } from '@/utils/clienteDataHelpers'

interface AdicionarClienteModalProps {
  onClienteAdicionado: () => void
}

export function AdicionarClienteModal({ onClienteAdicionado }: AdicionarClienteModalProps) {
  const { user, currentManagerName, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    vendedor: '',
    status_campanha: 'Brief'
  })
  const { addCliente } = useClienteOperations(user?.email || '', isAdmin, onClienteAdicionado)

  const handleSubmit = async () => {
    if (!formData.nome_cliente || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (!formData.email_cliente) {
      toast({
        title: "Erro",
        description: "Email do cliente é obrigatório",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      console.log("🟡 [AdicionarClienteModal] Iniciando adição de cliente")
      
      // Primeiro garantir que o cliente existe na tabela todos_clientes
      console.log('🔐 [AdicionarClienteModal] Garantindo que cliente existe na tabela todos_clientes...')
      const clienteExists = await ensureClienteExists(formData.email_cliente, formData.nome_cliente)
      
      if (!clienteExists) {
        throw new Error('Falha ao garantir que o cliente existe na tabela')
      }

      const vendedor = formData.vendedor || currentManagerName

      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        vendedor,
        email_gestor: user?.email,
        status_campanha: formData.status_campanha,
        data_venda: new Date().toISOString().split('T')[0],
        valor_comissao: 60.00,
        comissao_paga: false
      }

      console.log("🟡 [AdicionarClienteModal] Dados para adicionar:", clienteData)

      const success = await addCliente(clienteData)
      
      if (success) {
        setFormData({
          nome_cliente: '',
          telefone: '',
          email_cliente: '',
          vendedor: '',
          status_campanha: 'Brief'
        })
        setOpen(false)
        onClienteAdicionado()
      }
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              value={formData.nome_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
              placeholder="Nome completo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email do Cliente *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendedor">Vendedor</Label>
            <Input
              id="vendedor"
              value={formData.vendedor}
              onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
              placeholder={`Padrão: ${currentManagerName}`}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status da Campanha</Label>
            <Select
              value={formData.status_campanha}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status_campanha: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_CAMPANHA.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
