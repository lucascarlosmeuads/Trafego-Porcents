
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'

interface AdicionarClienteModalProps {
  onClienteAdicionado: () => void
}

export function AdicionarClienteModal({ onClienteAdicionado }: AdicionarClienteModalProps) {
  const { user, currentManagerName } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    vendedor: '',
    status_campanha: 'Brief'
  })

  const getTableName = (managerName: string): string => {
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    return tableMapping[managerName] || 'clientes_andreza'
  }

  const handleSubmit = async () => {
    if (!formData.nome_cliente || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const tableName = getTableName(currentManagerName)
      const vendedor = formData.vendedor || currentManagerName

      const clienteBruto = {
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

      // 🔍 Remove id e campos vazios, se tiverem vindo por acidente
      const clienteLimpo = Object.fromEntries(
        Object.entries(clienteBruto).filter(
          ([key, value]) => key !== 'id' && value != null
        )
      )

      // 👇 Verificação de debug
      console.log("🟡 Payload para insert:", clienteLimpo)

      const { error } = await supabase
        .from(tableName)
        .insert([clienteLimpo])

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso"
      })

      setFormData({
        nome_cliente: '',
        telefone: '',
        email_cliente: '',
        vendedor: '',
        status_campanha: 'Brief'
      })
      setOpen(false)
      onClienteAdicionado()
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
            <Label htmlFor="email">Email do Cliente</Label>
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
