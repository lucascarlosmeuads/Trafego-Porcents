import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { useClienteOperations } from '@/hooks/useClienteOperations'
import { ClientInstructionsModal } from '../ClientInstructionsModal'

interface AddClientModalProps {
  selectedManager?: string
  onClienteAdicionado: () => void
  gestorMode?: boolean
}

export function AddClientModal({ selectedManager, onClienteAdicionado, gestorMode = false }: AddClientModalProps) {
  const { user, currentManagerName, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedGestor, setSelectedGestor] = useState<string>('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [newClientData, setNewClientData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    vendedor: '',
    status_campanha: 'Brief',
    data_venda: new Date().toISOString().split('T')[0]
  })
  const { addCliente } = useClienteOperations(user?.email || '', isAdmin, onClienteAdicionado)

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

  const instructions = `Olá ${formData.nome_cliente || '[Nome do Cliente]'}! 🎉

Conta criada com sucesso! Para acessar aqui está seu email e sua senha:

📧 Email: ${formData.email_cliente || '[Email do Cliente]'}
🔐 Senha: parceriadesucesso

🔗 Acesse: https://login.trafegoporcents.com

O passo a passo com as instruções vai estar logo na primeira tela assim que logar. Seja bem-vindo!

🚨 Aguarde 1 dia pela criação do grupo. Se não for criado hoje, no máximo no outro dia cedo será criado. Fique tranquilo!

Qualquer dúvida, estamos aqui para ajudar! 💪`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instructions)
      setCopied(true)
      toast({
        title: "Copiado!",
        description: "Instruções copiadas para a área de transferência"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar as instruções",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async () => {
    if (!formData.nome_cliente || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (!formData.email_cliente) {
      toast({
        title: "Erro",
        description: "Email do cliente é obrigatório",
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

    // Para usuários em modo não-gestor: require gestor selection
    if (!gestorMode && !selectedGestor) {
      toast({
        title: "Erro",
        description: "Selecione um gestor para atribuir o cliente",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      console.log("🔵 [AddClientModal] === INICIANDO PROCESSO DE ADIÇÃO ===")
      console.log("🔵 [AddClientModal] Modo Gestor:", gestorMode)
      console.log("🔵 [AddClientModal] É Admin:", isAdmin)
      console.log("🔵 [AddClientModal] Email do usuário:", user?.email)
      
      // Determine final email_gestor based on mode
      let emailGestorFinal
      if (gestorMode) {
        // Em modo gestor, sempre usar o email do usuário logado
        emailGestorFinal = user?.email
        console.log("🔵 [AddClientModal] Usando email do gestor logado:", emailGestorFinal)
      } else {
        // Em modo admin normal, usar o gestor selecionado ou o email do usuário
        emailGestorFinal = isAdmin ? selectedGestor : user?.email
        console.log("🔵 [AddClientModal] Usando email selecionado/admin:", emailGestorFinal)
      }
      
      const vendedor = formData.vendedor || currentManagerName

      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        vendedor,
        email_gestor: emailGestorFinal,
        status_campanha: formData.status_campanha,
        data_venda: formData.data_venda,
        valor_comissao: 60.00,
        comissao_paga: false
      }

      console.log("🔵 [AddClientModal] Dados completos para adicionar:", clienteData)

      const result = await addCliente(clienteData)
      
      console.log("🔵 [AddClientModal] Resultado da operação:", result)
      
      if (result && result.success) {
        console.log("🟢 [AddClientModal] === CLIENTE CRIADO COM SUCESSO ===")
        
        // Limpar formulário
        setFormData({
          nome_cliente: '',
          telefone: '',
          email_cliente: '',
          vendedor: '',
          status_campanha: 'Brief',
          data_venda: new Date().toISOString().split('T')[0]
        })
        setSelectedGestor('')
        setOpen(false)
        
        // Atualizar dados
        onClienteAdicionado()

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

        // SEMPRE exibir o modal de instruções após criação bem-sucedida
        console.log("🔵 [AddClientModal] Preparando dados para o modal de instruções...")
        
        const dadosCliente = {
          email_cliente: clienteData.email_cliente,
          nome_cliente: clienteData.nome_cliente,
          id: result.clientData?.id || Math.random()
        }
        
        console.log("🔵 [AddClientModal] Dados do cliente para instruções:", dadosCliente)
        setNewClientData(dadosCliente)
        
        // Pequeno delay para garantir que o modal anterior feche
        setTimeout(() => {
          console.log("🟢 [AddClientModal] === ABRINDO MODAL DE INSTRUÇÕES ===")
          setShowInstructions(true)
        }, 300)
        
      } else {
        console.error("🔴 [AddClientModal] Falha na criação do cliente:", result)
        toast({
          title: "Erro",
          description: "Falha ao criar cliente",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('💥 [AddClientModal] Erro ao adicionar cliente:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar cliente",
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cliente
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          
          {/* INSTRUÇÕES PARA ENVIAR AO CLIENTE - POSICIONADAS AQUI CONFORME SOLICITADO */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-yellow-800 text-sm">📋 Mensagem para enviar ao cliente:</h3>
              <Button
                onClick={handleCopy}
                size="sm"
                className="ml-2"
                variant={copied ? "default" : "outline"}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <div className="bg-white border rounded p-3 text-sm">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">
                {instructions}
              </pre>
            </div>
            <p className="text-yellow-700 text-xs mt-2">
              💡 Após cadastrar o cliente, envie essa mensagem via WhatsApp
            </p>
            
            {/* Nota sobre senha padrão */}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 text-xs">
                A senha padrão será definida automaticamente como <strong>parceriadesucesso</strong>.
              </p>
            </div>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="data_venda">Data da Venda *</Label>
              <Input
                id="data_venda"
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData(prev => ({ ...prev, data_venda: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input
                id="nome"
                value={formData.nome_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email do Cliente *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email_cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>

            {/* Mostrar campo de gestor para qualquer usuário em modo não-gestor */}
            {!gestorMode && (
              <div className="grid gap-2">
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

            <div className="grid gap-2">
              <Label htmlFor="vendedor">Vendedor</Label>
              <Input
                id="vendedor"
                value={formData.vendedor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
                placeholder="Preenchido automaticamente com seu e-mail"
              />
              <p className="text-xs text-gray-500">Preenchido automaticamente com seu e-mail</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status da Campanha</Label>
              <Select
                value={formData.status_campanha}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status_campanha: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CAMPANHA.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar Cliente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClientInstructionsModal
        isOpen={showInstructions}
        onClose={() => {
          console.log("🔵 [AddClientModal] === FECHANDO MODAL DE INSTRUÇÕES ===")
          setShowInstructions(false)
          setNewClientData(null)
        }}
        clientEmail={newClientData?.email_cliente || ''}
        clientName={newClientData?.nome_cliente || ''}
      />
    </>
  )
}
