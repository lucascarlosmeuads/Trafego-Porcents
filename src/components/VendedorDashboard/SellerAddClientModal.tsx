
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Copy, Check, Calculator } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA } from '@/lib/supabase'
import { ClientInstructionsModal } from '../ClientInstructionsModal'
import { CommissionCalculator } from '../CommissionCalculator'
import { supabase } from '@/integrations/supabase/client'

interface SellerAddClientModalProps {
  onClienteAdicionado: (clienteData: any) => Promise<any>
}

export function SellerAddClientModal({ onClienteAdicionado }: SellerAddClientModalProps) {
  const { currentManagerName } = useAuth()
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
    status_campanha: 'Cliente Novo',
    data_venda: new Date().toISOString().split('T')[0],
    resumo_conversa_vendedor: '',
    valor_venda_inicial: null as number | null,
    valor_comissao: null as number | null
  })

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

Esse processo completo leva até 15 dias úteis, justamente pra garantir que tudo saia alinhado com seu público e com os melhores resultados.

Mas fica tranquilo que dependendo do seu projeto é bem mais rápido que isso, pedimos esse prazo pra garantirmos que não vamos atrasar e que vamos fazer com qualidade. Vou te atualizando em cada etapa, e qualquer dúvida ou ideia que surgir, estamos por aqui!

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

    if (!selectedGestor) {
      toast({
        title: "Erro",
        description: "Selecione um gestor para atribuir o cliente",
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

    setLoading(true)

    try {
      console.log("🔵 [SellerAddClientModal] === INICIANDO PROCESSO ===")
      
      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        email_gestor: selectedGestor,
        status_campanha: formData.status_campanha,
        data_venda: formData.data_venda,
        valor_venda_inicial: formData.valor_venda_inicial
      }

      console.log("🔵 [SellerAddClientModal] Dados para adicionar:", clienteData)

      const result = await onClienteAdicionado(clienteData)
      
      if (result && result.success) {
        console.log("🟢 [SellerAddClientModal] === CLIENTE CRIADO COM SUCESSO ===")
        console.log("🟢 [SellerAddClientModal] Resultado:", result)
        
        // Salvar resumo da conversa no briefing se foi preenchido
        if (formData.resumo_conversa_vendedor.trim()) {
          console.log("📝 [SellerAddClientModal] Salvando resumo da conversa no briefing...")
          
          try {
            const { error: briefingError } = await supabase
              .from('briefings_cliente')
              .upsert({
                email_cliente: formData.email_cliente.toLowerCase().trim(),
                resumo_conversa_vendedor: formData.resumo_conversa_vendedor.trim(),
                nome_produto: 'Tráfego Pago', // Valor padrão
              }, {
                onConflict: 'email_cliente'
              })

            if (briefingError) {
              console.error("❌ [SellerAddClientModal] Erro ao salvar resumo:", briefingError)
            } else {
              console.log("✅ [SellerAddClientModal] Resumo da conversa salvo com sucesso!")
            }
          } catch (briefingError) {
            console.error("💥 [SellerAddClientModal] Erro crítico ao salvar resumo:", briefingError)
          }
        }
        
        // Limpar formulário
        setFormData({
          nome_cliente: '',
          telefone: '',
          email_cliente: '',
          status_campanha: 'Cliente Novo',
          data_venda: new Date().toISOString().split('T')[0],
          resumo_conversa_vendedor: '',
          valor_venda_inicial: null,
          valor_comissao: null
        })
        setSelectedGestor('')
        setOpen(false)
        
        // SEMPRE mostrar modal de instruções para clientes criados com sucesso
        console.log("🟢 [SellerAddClientModal] Preparando modal de instruções...")
        
        const dadosCliente = {
          email_cliente: clienteData.email_cliente,
          nome_cliente: clienteData.nome_cliente,
          id: result.clientData?.id || Math.random()
        }
        
        setNewClientData(dadosCliente)
        
        // Mostrar modal de instruções
        setTimeout(() => {
          console.log("🟢 [SellerAddClientModal] === ABRINDO MODAL DE INSTRUÇÕES ===")
          setShowInstructions(true)
        }, 300)
        
      } else {
        console.error("❌ [SellerAddClientModal] Resultado indica falha:", result)
        toast({
          title: "Erro",
          description: "Erro ao adicionar cliente",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('💥 [SellerAddClientModal] Erro ao adicionar cliente:', error)
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          
          {/* Instructions section */}
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

            {/* Calculadora de Comissão */}
            <CommissionCalculator
              saleValue={formData.valor_venda_inicial}
              commissionValue={formData.valor_comissao}
              onSaleValueChange={(value) => setFormData(prev => ({ ...prev, valor_venda_inicial: value }))}
              onCommissionChange={(value) => setFormData(prev => ({ ...prev, valor_comissao: value }))}
              showRules={true}
            />

            <div className="grid gap-2">
              <Label htmlFor="resumo_conversa_vendedor">Resumo da Conversa com o Cliente</Label>
              <Textarea
                id="resumo_conversa_vendedor"
                value={formData.resumo_conversa_vendedor}
                onChange={(e) => setFormData(prev => ({ ...prev, resumo_conversa_vendedor: e.target.value }))}
                placeholder="Descreva brevemente como foi a conversa com o cliente, principais objeções superadas, expectativas demonstradas, etc."
                rows={3}
              />
              <p className="text-yellow-700 text-xs">
                📝 Campo opcional. Este resumo ajudará o gestor a entender melhor o contexto da venda.
              </p>
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
          console.log("🔵 [SellerAddClientModal] === FECHANDO MODAL DE INSTRUÇÕES ===")
          setShowInstructions(false)
          setNewClientData(null)
        }}
        clientEmail={newClientData?.email_cliente || ''}
        clientName={newClientData?.nome_cliente || ''}
      />
    </>
  )
}
