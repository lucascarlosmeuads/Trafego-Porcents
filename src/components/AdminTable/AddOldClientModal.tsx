
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, X } from 'lucide-react'
import { useClienteAdd } from '@/hooks/useClienteAdd'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface AddOldClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: () => void
}

export function AddOldClientModal({ isOpen, onClose, onClientAdded }: AddOldClientModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { addCliente, loading } = useClienteAdd(user?.email || '', true, async () => {})
  
  const [formData, setFormData] = useState({
    nome_cliente: '',
    email_cliente: '',
    telefone: '',
    vendedor: '',
    email_gestor: '',
    status_campanha: 'Cliente Antigo', // Sempre será "Cliente Antigo"
    data_venda: '',
    descricao_problema: '',
    valor_comissao: 60.00,
    origem_cadastro: 'admin_antigo'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome_cliente.trim()) {
      newErrors.nome_cliente = 'Nome do cliente é obrigatório'
    }

    if (!formData.email_cliente.trim()) {
      newErrors.email_cliente = 'Email do cliente é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email_cliente)) {
      newErrors.email_cliente = 'Email inválido'
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    }

    if (!formData.email_gestor.trim()) {
      newErrors.email_gestor = 'Gestor responsável é obrigatório'
    }

    if (!formData.data_venda) {
      newErrors.data_venda = 'Data da venda é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const clienteData = {
        ...formData,
        valor_comissao: Number(formData.valor_comissao),
        status_campanha: 'Cliente Antigo', // Garantir que sempre seja Cliente Antigo
        created_at: new Date().toISOString()
      }

      const result = await addCliente(clienteData)
      
      if (result.success) {
        toast({
          title: "Cliente antigo adicionado!",
          description: "O cliente antigo foi cadastrado com sucesso.",
        })
        onClientAdded()
        handleClose()
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente antigo:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar cliente antigo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setFormData({
      nome_cliente: '',
      email_cliente: '',
      telefone: '',
      vendedor: '',
      email_gestor: '',
      status_campanha: 'Cliente Antigo',
      data_venda: '',
      descricao_problema: '',
      valor_comissao: 60.00,
      origem_cadastro: 'admin_antigo'
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const gestoresOptions = [
    { value: 'carol@trafegoporcents.com', label: 'Carol' },
    { value: 'andreza@trafegoporcents.com', label: 'Andreza' },
    { value: 'jose@trafegoporcents.com', label: 'José' },
    { value: 'falcao@trafegoporcents.com', label: 'Falcão' },
    { value: 'rullian@trafegoporcents.com', label: 'Rullian' },
    { value: 'danielribeiro@trafegoporcents.com', label: 'Daniel Ribeiro' },
    { value: 'danielmoreira@trafegoporcents.com', label: 'Daniel Moreira' },
    { value: 'guilherme@trafegoporcents.com', label: 'Guilherme' },
    { value: 'emily@trafegoporcents.com', label: 'Emily' },
    { value: 'leandrodrumzique@trafegoporcents.com', label: 'Leandro' },
    { value: 'kimberlly@trafegoporcents.com', label: 'Kimberlly' },
    { value: 'junior@trafegoporcents.com', label: 'Junior' },
    { value: 'kely@trafegoporcents.com', label: 'Kely' },
    { value: 'jefferson@trafegoporcents.com', label: 'Jefferson' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Adicionar Cliente Antigo
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Este cliente será adicionado com status "Cliente Antigo"
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => handleInputChange('nome_cliente', e.target.value)}
                placeholder="Digite o nome completo"
                className={errors.nome_cliente ? 'border-red-500' : ''}
              />
              {errors.nome_cliente && (
                <span className="text-red-500 text-sm">{errors.nome_cliente}</span>
              )}
            </div>

            <div>
              <Label htmlFor="email_cliente">Email do Cliente *</Label>
              <Input
                id="email_cliente"
                type="email"
                value={formData.email_cliente}
                onChange={(e) => handleInputChange('email_cliente', e.target.value)}
                placeholder="cliente@email.com"
                className={errors.email_cliente ? 'border-red-500' : ''}
              />
              {errors.email_cliente && (
                <span className="text-red-500 text-sm">{errors.email_cliente}</span>
              )}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.telefone ? 'border-red-500' : ''}
              />
              {errors.telefone && (
                <span className="text-red-500 text-sm">{errors.telefone}</span>
              )}
            </div>

            <div>
              <Label htmlFor="vendedor">Vendedor</Label>
              <Input
                id="vendedor"
                value={formData.vendedor}
                onChange={(e) => handleInputChange('vendedor', e.target.value)}
                placeholder="Nome do vendedor (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="email_gestor">Gestor Responsável *</Label>
              <Select
                value={formData.email_gestor}
                onValueChange={(value) => handleInputChange('email_gestor', value)}
              >
                <SelectTrigger className={errors.email_gestor ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o gestor" />
                </SelectTrigger>
                <SelectContent>
                  {gestoresOptions.map(gestor => (
                    <SelectItem key={gestor.value} value={gestor.value}>
                      {gestor.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.email_gestor && (
                <span className="text-red-500 text-sm">{errors.email_gestor}</span>
              )}
            </div>

            <div>
              <Label htmlFor="data_venda">Data da Venda *</Label>
              <Input
                id="data_venda"
                type="date"
                value={formData.data_venda}
                onChange={(e) => handleInputChange('data_venda', e.target.value)}
                className={errors.data_venda ? 'border-red-500' : ''}
              />
              {errors.data_venda && (
                <span className="text-red-500 text-sm">{errors.data_venda}</span>
              )}
            </div>

            <div>
              <Label htmlFor="valor_comissao">Valor da Comissão (R$)</Label>
              <Input
                id="valor_comissao"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_comissao}
                onChange={(e) => handleInputChange('valor_comissao', Number(e.target.value))}
                placeholder="60.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao_problema">Observações</Label>
            <Textarea
              id="descricao_problema"
              value={formData.descricao_problema}
              onChange={(e) => handleInputChange('descricao_problema', e.target.value)}
              placeholder="Informações adicionais sobre o cliente antigo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar Cliente Antigo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
