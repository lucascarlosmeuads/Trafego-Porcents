
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

// Status disponíveis para campanha
const STATUS_CAMPANHA = [
  'Cliente Novo',
  'Preenchimento do Formulário',
  'Brief',
  'Criativo', 
  'Site',
  'Agendamento',
  'Configurando BM',
  'Subindo Campanha',
  'Otimização',
  'Problema',
  'Cliente Sumiu',
  'Reembolso',
  'Saque Pendente',
  'Campanha Anual',
  'Urgente',
  'Cliente Antigo'
] as const

interface NewSellerAddClientFormProps {
  onAddClient: (clientData: any) => Promise<any>
  isLoading: boolean
  onCancel: () => void
}

export function NewSellerAddClientForm({ onAddClient, isLoading, onCancel }: NewSellerAddClientFormProps) {
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    data_venda: '',
    vendedor: '',
    status_campanha: ''
  })

  console.log('🎯 [NewSellerAddClientForm] Componente renderizado - Valor padrão R$60,00 será aplicado automaticamente')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('📝 [NewSellerAddClientForm] === SUBMISSÃO DO FORMULÁRIO ===')
    console.log('📋 [NewSellerAddClientForm] Dados do formulário:', formData)

    // Validações básicas
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

    // ✅ GARANTIR VALOR PADRÃO R$60,00 - LOG ESPECÍFICO
    const clientDataWithDefaults = {
      ...formData,
      valor_comissao: 60.00, // ✅ VALOR PADRÃO FORÇADO
      comissao: 'Pendente',
      site_status: 'pendente',
      site_pago: false
    }

    console.log('💰 [NewSellerAddClientForm] VALOR COMISSÃO DEFINIDO: R$60,00')
    console.log('📤 [NewSellerAddClientForm] Dados finais enviados:', clientDataWithDefaults)

    const result = await onAddClient(clientDataWithDefaults)

    if (result && typeof result === 'object' && result.success) {
      console.log('✅ [NewSellerAddClientForm] Cliente adicionado com sucesso!')
      
      // Limpar formulário
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
        description: `Cliente ${formData.nome_cliente} adicionado com valor padrão R$60,00`
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

      onCancel() // Fechar modal
    } else if (result && result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Adicionar Novo Cliente</CardTitle>
        <p className="text-sm text-muted-foreground">
          💰 Valor padrão da comissão: R$60,00
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <Label htmlFor="email_cliente">Email do Cliente</Label>
              <Input
                id="email_cliente"
                type="email"
                value={formData.email_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <Label htmlFor="data_venda">Data da Venda *</Label>
              <Input
                id="data_venda"
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData(prev => ({ ...prev, data_venda: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="vendedor">Vendedor</Label>
              <Input
                id="vendedor"
                value={formData.vendedor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
                placeholder="Nome do vendedor"
              />
            </div>

            <div>
              <Label htmlFor="status_campanha">Status da Campanha *</Label>
              <Select 
                value={formData.status_campanha}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status_campanha: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CAMPANHA.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Cliente'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
