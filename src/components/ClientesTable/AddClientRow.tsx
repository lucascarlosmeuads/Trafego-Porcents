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
import { useAuth } from '@/hooks/useAuth'

interface AddClientRowProps {
  onAddClient: (clientData: any) => Promise<any>
  isLoading: boolean
  getStatusColor: (status: string) => string
  selectedManager?: string | null
}

export function AddClientRow({ onAddClient, isLoading, getStatusColor, selectedManager }: AddClientRowProps) {
  const { user, isAdmin } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [newClientData, setNewClientData] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    data_venda: '',
    vendedor: '',
    status_campanha: '',
    email_gestor: '' // Adicionar campo para gestor
  })

  const handleSave = async () => {
    console.log('🔵 [AddClientRow] === INICIANDO CRIAÇÃO DE CLIENTE ===')
    console.log('🔵 [AddClientRow] Dados do formulário:', formData)
    console.log('🔵 [AddClientRow] Selected manager:', selectedManager)
    console.log('🔵 [AddClientRow] User email:', user?.email)
    console.log('🔵 [AddClientRow] Is admin:', isAdmin)
    
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

    // Para admin: verificar se gestor foi selecionado
    if (isAdmin && !selectedManager) {
      toast({
        title: "Erro",
        description: "Selecione um gestor para atribuir o cliente",
        variant: "destructive"
      })
      return
    }

    console.log('🔵 [AddClientRow] Validação passou, chamando onAddClient...')
    
    const clienteParaAdicionar = {
      ...formData,
      email_gestor: isAdmin ? selectedManager : user?.email,
      vendedor: formData.vendedor || user?.email,
      valor_comissao: 60.00
    }

    console.log('🔵 [AddClientRow] Cliente para adicionar:', clienteParaAdicionar)

    const result = await onAddClient(clienteParaAdicionar)
    
    console.log('🔵 [AddClientRow] Resultado do onAddClient:', result)

    if (result && typeof result === 'object' && result.success) {
      console.log('🟢 [AddClientRow] === CLIENTE CRIADO COM SUCESSO ===')
      
      // Clear form and exit edit mode
      setFormData({
        nome_cliente: '',
        telefone: '',
        email_cliente: '',
        data_venda: '',
        vendedor: '',
        status_campanha: '',
        email_gestor: ''
      })
      setIsEditing(false)
      
      toast({
        title: "✅ Sucesso",
        description: `Cliente adicionado com sucesso!`
      })

      // Show instructions modal for new clients only
      if (result.isNewClient) {
        setNewClientData(result.clientData)
        setShowInstructions(true)
      }
    } else {
      console.error('❌ [AddClientRow] Resultado indica falha:', result)
    }
  }

  const handleCancel = () => {
    setFormData({
      nome_cliente: '',
      telefone: '',
      email_cliente: '',
      data_venda: '',
      vendedor: '',
      status_campanha: '',
      email_gestor: ''
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
          <span className="text-xs text-green-600 font-semibold">R$60,00</span>
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
              onClick={handleCancel}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      <ClientInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        clientEmail={newClientData?.email_cliente || ''}
        clientName={newClientData?.nome_cliente || ''}
      />
    </>
  )
}
