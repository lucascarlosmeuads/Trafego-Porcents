
import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AddClientRowProps {
  onAddClient: (clientData: any) => Promise<boolean>
  isLoading: boolean
}

export function AddClientRow({ onAddClient, isLoading }: AddClientRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    data_venda: '',
    vendedor: ''
  })

  const handleSave = async () => {
    // Validar campos obrigatórios
    if (!formData.nome_cliente.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive"
      })
      return
    }

    if (!formData.telefone.trim()) {
      toast({
        title: "Erro",
        description: "Telefone é obrigatório",
        variant: "destructive"
      })
      return
    }

    if (!formData.data_venda) {
      toast({
        title: "Erro",
        description: "Data da venda é obrigatória",
        variant: "destructive"
      })
      return
    }

    const success = await onAddClient({
      ...formData,
      status_campanha: 'Preenchimento do Formulário', // Status padrão
      comissao_paga: false,
      valor_comissao: 60.00
    })

    if (success) {
      // Limpar formulário e sair do modo de edição
      setFormData({
        nome_cliente: '',
        telefone: '',
        email_cliente: '',
        data_venda: '',
        vendedor: ''
      })
      setIsEditing(false)
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso"
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      nome_cliente: '',
      telefone: '',
      email_cliente: '',
      data_venda: '',
      vendedor: ''
    })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <TableRow className="border-dashed border-2 border-muted hover:bg-muted/10">
        <TableCell colSpan={15} className="text-center py-4">
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="text-muted-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Novo Cliente
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className="bg-muted/20 border-dashed border-2 border-primary/30">
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell>
        <Input
          value={formData.data_venda}
          onChange={(e) => setFormData(prev => ({ ...prev, data_venda: e.target.value }))}
          type="date"
          className="h-8 text-xs"
          placeholder="Data da venda"
        />
      </TableCell>
      <TableCell>
        <Input
          value={formData.nome_cliente}
          onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
          className="h-8 text-xs"
          placeholder="Nome do cliente *"
        />
      </TableCell>
      <TableCell>
        <Input
          value={formData.telefone}
          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
          className="h-8 text-xs"
          placeholder="Telefone *"
        />
      </TableCell>
      <TableCell>
        <Input
          value={formData.email_cliente}
          onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
          type="email"
          className="h-8 text-xs"
          placeholder="Email"
        />
      </TableCell>
      <TableCell>
        <Input
          value={formData.vendedor}
          onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
          className="h-8 text-xs"
          placeholder="Vendedor"
        />
      </TableCell>
      <TableCell className="text-center">
        <span className="text-xs text-muted-foreground">Auto</span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-700 border border-gray-500/30">
          Preenchimento do Formulário
        </span>
      </TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">-</TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
