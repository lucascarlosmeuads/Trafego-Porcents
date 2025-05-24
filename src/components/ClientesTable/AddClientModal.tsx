
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { STATUS_CAMPANHA } from '@/lib/supabase'

interface AddClientModalProps {
  selectedManager?: string
  onClienteAdicionado: () => void
}

export function AddClientModal({ selectedManager, onClienteAdicionado }: AddClientModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    vendedor: '',
    status_campanha: 'Preenchimento do Formulário',
    data_venda: new Date().toISOString().split('T')[0]
  })
  const { user, isAdmin } = useAuth()

  const getTableName = (managerName?: string): string => {
    if (managerName === 'Lucas Falcão') return 'clientes_lucas_falcao'
    if (managerName === 'Andreza') return 'clientes_andreza'
    
    // Fallback baseado no email do usuário
    if (user?.email === 'lucas@admin.com' || user?.email === 'lucas.falcao@gestor.com') {
      return 'clientes_lucas_falcao'
    }
    
    return 'clientes_andreza'
  }

  const handleSubmit = async () => {
    // Validações
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

    setLoading(true)
    
    try {
      const tableName = getTableName(selectedManager)
      
      console.log('🚀 Modal: Adicionando cliente na tabela:', tableName)
      console.log('📥 Modal: Dados do formulário:', formData)
      
      // Criar objeto ABSOLUTAMENTE limpo - GARANTINDO que não há ID
      const cleanClienteData = {
        nome_cliente: formData.nome_cliente.trim(),
        telefone: formData.telefone.trim(),
        email_cliente: formData.email_cliente.trim(),
        vendedor: formData.vendedor.trim() || selectedManager || 'Gestor',
        status_campanha: formData.status_campanha,
        data_venda: formData.data_venda,
        email_gestor: user?.email || '',
        comissao_paga: false,
        valor_comissao: 60.00,
        site_status: 'pendente'
      }

      // Remover qualquer campo que seja null, undefined ou string vazia
      const finalData = Object.fromEntries(
        Object.entries(cleanClienteData).filter(([key, value]) => {
          // Manter apenas campos que não sejam null, undefined ou string vazia (exceto campos booleanos e numéricos)
          if (typeof value === 'boolean' || typeof value === 'number') return true
          return value !== null && value !== undefined && value !== ''
        })
      )

      console.log('🧹 Modal: Objeto final LIMPO (sem id):', finalData)
      console.log('🔍 Modal: Tem campo ID?', 'id' in finalData ? '❌ SIM - ERRO!' : '✅ NÃO - OK!')
      console.log('🔍 Modal: Tem campo created_at?', 'created_at' in finalData ? '❌ SIM - ERRO!' : '✅ NÃO - OK!')
      console.log('🔍 Modal: Todas as chaves:', Object.keys(finalData))

      console.log('📤 Modal: Enviando para Supabase...')

      const { data, error } = await supabase
        .from(tableName)
        .insert([finalData])
        .select()

      if (error) {
        console.error('❌ Modal: Erro do Supabase:', error)
        throw error
      }

      console.log('✅ Modal: Cliente adicionado com sucesso:', data)

      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!"
      })

      // Limpar formulário
      setFormData({
        nome_cliente: '',
        telefone: '',
        email_cliente: '',
        vendedor: '',
        status_campanha: 'Preenchimento do Formulário',
        data_venda: new Date().toISOString().split('T')[0]
      })
      
      setOpen(false)
      onClienteAdicionado()

    } catch (error: any) {
      console.error('💥 Modal: Erro geral:', error)
      toast({
        title: "Erro",
        description: `Erro ao adicionar cliente: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              value={formData.nome_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
              placeholder="Nome completo"
            />
          </div>
          
          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email do Cliente</Label>
            <Input
              id="email"
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
              placeholder="cliente@email.com"
            />
          </div>
          
          <div>
            <Label htmlFor="vendedor">Vendedor</Label>
            <Input
              id="vendedor"
              value={formData.vendedor}
              onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
              placeholder={`Padrão: ${selectedManager || 'Gestor'}`}
            />
          </div>

          <div>
            <Label htmlFor="data_venda">Data da Venda</Label>
            <Input
              id="data_venda"
              type="date"
              value={formData.data_venda}
              onChange={(e) => setFormData(prev => ({ ...prev, data_venda: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status da Campanha</Label>
            <Select 
              value={formData.status_campanha} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status_campanha: value }))}
            >
              <SelectTrigger>
                <SelectValue />
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
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Adicionando...' : 'Adicionar Cliente'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
