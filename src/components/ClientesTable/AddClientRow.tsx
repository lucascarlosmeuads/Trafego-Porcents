
import { useState } from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { ClientInstructionsModal } from '../ClientInstructionsModal'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { useAuth } from '@/hooks/useAuth'

interface AddClientRowProps {
  onCancel: () => void
  onSuccess: () => void
}

export function AddClientRow({ onCancel, onSuccess }: AddClientRowProps) {
  const { user, isAdmin } = useAuth()
  const [showInstructions, setShowInstructions] = useState(false)
  const [newClientData, setNewClientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    data_venda: '',
    vendedor: '',
    status_campanha: ''
  })

  const { addCliente } = useClienteOperations(user?.email || '', isAdmin, onSuccess)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Cliente Novo': 'bg-blue-100 text-blue-800 border-blue-200',
      'Brief': 'bg-orange-100 text-orange-800 border-orange-200',
      'Material': 'bg-purple-100 text-purple-800 border-purple-200',
      'No Ar': 'bg-green-100 text-green-800 border-green-200',
      'Off': 'bg-red-100 text-red-800 border-red-200',
      'Reembolso': 'bg-gray-100 text-gray-800 border-gray-200',
      'Problema': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

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

    if (!formData.status_campanha) {
      toast({
        title: "Erro",
        description: "Selecione um status válido",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    const result = await addCliente({
      ...formData,
      comissao_paga: false,
      valor_comissao: 60.00
    })

    setIsLoading(false)

    // Type guard to check if result is not false
    if (result && typeof result === 'object' && result.success) {
      // Clear form and exit edit mode
      setFormData({
        nome_cliente: '',
        telefone: '',
        email_cliente: '',
        data_venda: '',
        vendedor: '',
        status_campanha: ''
      })
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso"
      })

      // Mostrar aviso sobre senha padrão se foi definida
      if (result.senhaDefinida) {
        setTimeout(() => {
          toast({
            title: "🔐 Senha padrão definida",
            description: "Senha padrão definida como: parceriadesucesso",
            duration: 8000
          })
        }, 1000)
      }

      // Show instructions modal for new clients only
      if (result.isNewClient) {
        setNewClientData(result.clientData)
        setShowInstructions(true)
      }

      onSuccess()
    }
  }

  return (
    <>
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
          <Select 
            value={formData.status_campanha}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status_campanha: value }))}
          >
            <SelectTrigger className="h-8 w-48 bg-background border-border text-foreground">
              <SelectValue placeholder="Selecione o status *">
                {formData.status_campanha && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(formData.status_campanha)}`}>
                    {formData.status_campanha}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {STATUS_CAMPANHA.map(status => (
                <SelectItem key={status} value={status}>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              onClick={onCancel}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Instructions Modal */}
      <ClientInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        clientEmail={newClientData?.email_cliente || ''}
        clientName={newClientData?.nome_cliente || ''}
      />
    </>
  )
}
