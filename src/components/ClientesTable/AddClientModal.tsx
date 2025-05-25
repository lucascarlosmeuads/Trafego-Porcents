
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
import { ClientInstructionsModal } from '../ClientInstructionsModal'

interface AddClientModalProps {
  selectedManager?: string
  onClienteAdicionado: () => void
}

export function AddClientModal({ selectedManager, onClienteAdicionado }: AddClientModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedGestor, setSelectedGestor] = useState<string>('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [newClientData, setNewClientData] = useState<any>(null)
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

  // Predefined manager emails for admin selection
  const managerOptions = [
    { name: 'Andreza', email: 'andreza@trafegoporcents.com' },
    { name: 'Carol', email: 'carol@trafegoporcents.com' },
    { name: 'Junior', email: 'junior@trafegoporcents.com' },
    { name: 'Daniel Moreira', email: 'danielmoreira@trafegoporcents.com' },
    { name: 'Daniel Ribeiro', email: 'danielribeiro@trafegoporcents.com' },
    { name: 'Kimberlly', email: 'kimberlly@trafegoporcents.com' },
    { name: 'Jose', email: 'jose@trafegoporcents.com' },
    { name: 'Emily', email: 'emily@trafegoporcents.com' },
    { name: 'Falcao', email: 'falcao@trafegoporcents.com' },
    { name: 'Felipe Almeida', email: 'felipealmeida@trafegoporcents.com' },
    { name: 'Franciellen', email: 'franciellen@trafegoporcents.com' },
    { name: 'Guilherme', email: 'guilherme@trafegoporcents.com' },
    { name: 'Leandro Drumzique', email: 'leandrodrumzique@trafegoporcents.com' },
    { name: 'Matheus Paviani', email: 'matheuspaviani@trafegoporcents.com' },
    { name: 'Rullian', email: 'rullian@trafegoporcents.com' }
  ]

  const handleSubmit = async () => {
    // Validations
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

    // For admin: require gestor selection
    if (isAdmin && !selectedGestor) {
      toast({
        title: "Erro",
        description: "Selecione um gestor para atribuir o cliente",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      console.log('🚀 [AddClientModal] Adicionando cliente')
      console.log('📥 [AddClientModal] Dados do formulário:', formData)
      console.log('👤 [AddClientModal] Usuário logado:', user?.email)
      console.log('🔒 [AddClientModal] É admin?', isAdmin)
      console.log('🏷️ [AddClientModal] Gestor selecionado:', selectedGestor)
      
      // Determine final email_gestor based on role
      const emailGestorFinal = isAdmin ? selectedGestor : user?.email

      console.log('📧 [AddClientModal] Email gestor final determinado:', emailGestorFinal)
      
      if (!emailGestorFinal) {
        throw new Error('Não foi possível determinar o email do gestor')
      }

      // Prepare client data
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

      const result = await addCliente(clienteData)

      // Type guard to check if result is not false
      if (result && typeof result === 'object' && result.success) {
        // Clear form
        setFormData({
          nome_cliente: '',
          telefone: '',
          email_cliente: '',
          vendedor: '',
          status_campanha: 'Preenchimento do Formulário',
          data_venda: new Date().toISOString().split('T')[0]
        })
        setSelectedGestor('')
        
        setOpen(false)
        onClienteAdicionado()

        // Show instructions modal for new clients only
        if (result.isNewClient) {
          setNewClientData(result.clientData)
          setShowInstructions(true)
        }
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

  return (
    <>
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

            {/* Admin-only: Gestor Selection */}
            {isAdmin && (
              <div>
                <Label htmlFor="gestor">Atribuir ao Gestor *</Label>
                <Select value={selectedGestor} onValueChange={setSelectedGestor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gestor" />
                  </SelectTrigger>
                  <SelectContent>
                    {managerOptions.map((manager) => (
                      <SelectItem key={manager.email} value={manager.email}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
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
