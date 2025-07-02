import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useClienteAdd } from '@/hooks/useClienteAdd'
import { CurrencyInput } from '@/components/ui/currency-input'

interface NewSellerAddClientFormProps {
  userEmail: string
  onClientAdded?: () => void
}

export function NewSellerAddClientForm({ userEmail, onClientAdded }: NewSellerAddClientFormProps) {
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [emailCliente, setEmailCliente] = useState('')
  const [emailGestor, setEmailGestor] = useState(userEmail)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [valorVenda, setValorVenda] = useState('')
  const [valorVendaNumerico, setValorVendaNumerico] = useState(0)
  const { toast } = useToast()
  const { addCliente } = useClienteAdd(userEmail, false, () => {})

  const resetForm = () => {
    setNomeCliente('')
    setTelefone('')
    setEmailCliente('')
    setEmailGestor(userEmail)
    setValorVenda('')
    setValorVendaNumerico(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nomeCliente.trim() || !telefone.trim() || !emailCliente.trim() || !emailGestor.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
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

    try {
      setIsSubmitting(true)
      
      const clienteData = {
        nome_cliente: nomeCliente.trim(),
        telefone: telefone.trim(),
        email_cliente: emailCliente.trim().toLowerCase(),
        email_gestor: emailGestor,
        status_campanha: 'Cliente Novo',
        data_venda: new Date().toISOString().split('T')[0],
        valor_venda_inicial: valorVendaNumerico // Novo campo
      }

      const resultado = await addCliente(clienteData)
      
      if (resultado?.success) {
        resetForm()
        onClientAdded?.()
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cadastrar Novo Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Cliente'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
