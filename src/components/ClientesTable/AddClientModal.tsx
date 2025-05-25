
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { useAuth } from '@/hooks/useAuth'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { ensureClienteExists } from '@/utils/clienteDataHelpers'

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
  const { addCliente } = useClienteOperations(user?.email || '', isAdmin, onClienteAdicionado)

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

    if (!formData.email_cliente.trim()) {
      toast({
        title: "Erro",
        description: "Email do cliente é obrigatório",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      console.log('🚀 [AddClientModal] Adicionando cliente na tabela todos_clientes')
      console.log('📥 [AddClientModal] Dados do formulário:', formData)
      console.log('👤 [AddClientModal] Usuário logado:', user?.email)
      console.log('🔒 [AddClientModal] É admin?', isAdmin)
      console.log('🏷️ [AddClientModal] Manager selecionado:', selectedManager)
      
      // REGRA CRÍTICA: Para gestores não-admin, SEMPRE usar o email do usuário logado
      // Para admin, usar o email do gestor selecionado se houver seleção
      const emailGestorFinal = !isAdmin ? user?.email : 
        (selectedManager ? await getManagerEmailFromName(selectedManager) : user?.email)

      console.log('📧 [AddClientModal] Email gestor final determinado:', emailGestorFinal)
      
      if (!emailGestorFinal) {
        throw new Error('Não foi possível determinar o email do gestor')
      }

      // Step 1: Garantir que o cliente existe na tabela todos_clientes (criar se necessário)
      console.log('🔐 [AddClientModal] Garantindo que cliente existe na tabela todos_clientes...')
      const clienteExists = await ensureClienteExists(formData.email_cliente, formData.nome_cliente)
      
      if (!clienteExists) {
        throw new Error('Falha ao garantir que o cliente existe na tabela')
      }

      // Step 2: Usar o hook useClienteOperations para adicionar
      const clienteData = {
        nome_cliente: formData.nome_cliente.trim(),
        telefone: formData.telefone.trim(),
        email_cliente: formData.email_cliente.trim(),
        vendedor: formData.vendedor.trim() || selectedManager || 'Gestor',
        status_campanha: formData.status_campanha,
        data_venda: formData.data_venda,
        email_gestor: emailGestorFinal
      }

      console.log('🧹 [AddClientModal] Objeto final para inserção:', clienteData)

      const success = await addCliente(clienteData)

      if (success) {
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
      }

    } catch (error: any) {
      console.error('💥 [AddClientModal] Erro geral:', error)
      toast({
        title: "Erro",
        description: `Erro ao adicionar cliente: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Função auxiliar para obter email do gestor
  const getManagerEmailFromName = async (managerName: string): Promise<string> => {
    console.log('🔍 [AddClientModal] Buscando email para o gestor:', managerName)
    
    // Fallback para mapeamento manual
    const emailMapping: { [key: string]: string } = {
      'Lucas Falcão': 'lucas.falcao@gestor.com',
      'Andreza': 'andreza@trafegoporcents.com',
      'Carol': 'carol@trafegoporcents.com',
      'Junior': 'junior@trafegoporcents.com',
      'Junior Gestor': 'junior@trafegoporcents.com',
      'Daniel': 'daniel@gestor.com',
      'Danielmoreira': 'danielmoreira@trafegoporcents.com',
      'Danielribeiro': 'danielribeiro@trafegoporcents.com',
      'Kimberlly': 'kimberlly@trafegoporcents.com',
      'Andresa': 'andresa@gestor.com',
      'Jose': 'jose@trafegoporcents.com',
      'Emily': 'emily@trafegoporcents.com',
      'Falcao': 'falcao@trafegoporcents.com',
      'Felipe Almeida': 'felipealmeida@trafegoporcents.com',
      'Franciellen': 'franciellen@trafegoporcents.com',
      'Guilherme': 'guilherme@trafegoporcents.com',
      'Leandrodrumzique': 'leandrodrumzique@trafegoporcents.com',
      'Matheuspaviani': 'matheuspaviani@trafegoporcents.com',
      'Rullian': 'rullian@trafegoporcents.com'
    }
    
    const email = emailMapping[managerName] || user?.email || 'andreza@trafegoporcents.com'
    console.log('📧 [AddClientModal] Email do mapeamento manual:', email, 'para gestor:', managerName)
    return email
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
            <Label htmlFor="email">Email do Cliente *</Label>
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
