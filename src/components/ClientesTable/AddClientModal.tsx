import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useClienteAdd } from '@/hooks/useClienteAdd'
import { CurrencyInput } from '@/components/ui/currency-input'
import { parseCurrency } from '@/utils/currencyUtils'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded?: () => void
  userEmail: string
  isAdmin: boolean
}

export function AddClientModal({ 
  isOpen, 
  onClose, 
  onClientAdded, 
  userEmail, 
  isAdmin 
}: AddClientModalProps) {
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [emailGestor, setEmailGestor] = useState('')
  const [statusCampanha, setStatusCampanha] = useState('Cliente Novo')
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split('T')[0])
  const [valorVenda, setValorVenda] = useState('')
  const [valorVendaNumerico, setValorVendaNumerico] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { addCliente } = useClienteAdd(userEmail, isAdmin, () => {})

  const resetForm = () => {
    setNomeCliente('')
    setTelefone('')
    setEmailCliente('')
    setVendedor('')
    setEmailGestor('')
    setStatusCampanha('Cliente Novo')
    setDataVenda(new Date().toISOString().split('T')[0])
    setValorVenda('')
    setValorVendaNumerico(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nomeCliente.trim() || !telefone.trim() || !emailCliente.trim() || !vendedor.trim() || !emailGestor.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (valorVendaNumerico <= 0) {
      toast({
        title: "Erro", 
        description: "O valor da venda deve ser maior que zero",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const clienteData = {
        nome_cliente: nomeCliente.trim(),
        telefone: telefone.trim(),
        email_cliente: emailCliente.trim().toLowerCase(),
        vendedor: vendedor.trim(),
        email_gestor: emailGestor.trim().toLowerCase(),
        status_campanha: statusCampanha,
        data_venda: dataVenda,
        valor_venda_inicial: valorVendaNumerico // Novo campo
      }

      const resultado = await addCliente(clienteData)
      
      if (resultado?.success) {
        resetForm()
        onClose()
        onClientAdded?.()
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome-cliente">Nome do Cliente *</Label>
            <Input
              id="nome-cliente"
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-cliente">Email do Cliente *</Label>
            <Input
              id="email-cliente"
              type="email"
              value={emailCliente}
              onChange={(e) => setEmailCliente(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor *</Label>
            <Input
              id="vendedor"
              type="text"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-gestor">Email do Gestor *</Label>
            <Input
              id="email-gestor"
              type="email"
              value={emailGestor}
              onChange={(e) => setEmailGestor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-campanha">Status da Campanha</Label>
            <select
              id="status-campanha"
              value={statusCampanha}
              onChange={(e) => setStatusCampanha(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Cliente Novo">Cliente Novo</option>
              <option value="Formulário">Formulário</option>
              <option value="Brief">Brief</option>
              <option value="Criativo">Criativo</option>
              <option value="Site">Site</option>
              <option value="Agendamento">Agendamento</option>
              <option value="Configurando BM">Configurando BM</option>
              <option value="Subindo Campanha">Subindo Campanha</option>
              <option value="Otimização">Otimização</option>
              <option value="Problema">Problema</option>
              <option value="Cliente Sumiu">Cliente Sumiu</option>
              <option value="Reembolso">Reembolso</option>
              <option value="Saque Pendente">Saque Pendente</option>
              <option value="Campanha Anual">Campanha Anual</option>
              <option value="Urgente">Urgente</option>
              <option value="Cliente Antigo">Cliente Antigo</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-venda">Data da Venda</Label>
            <Input
              id="data-venda"
              type="date"
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor-venda">Valor da Venda *</Label>
            <CurrencyInput
              value={valorVenda}
              onChange={(formatted, numeric) => {
                setValorVenda(formatted)
                setValorVendaNumerico(numeric)
              }}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
