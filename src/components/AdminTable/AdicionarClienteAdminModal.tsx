
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { STATUS_CAMPANHA, supabase } from '@/lib/supabase'

interface AdicionarClienteAdminModalProps {
  onClienteAdicionado: () => void
}

export function AdicionarClienteAdminModal({ onClienteAdicionado }: AdicionarClienteAdminModalProps) {
  const { user, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    vendedor: '',
    email_gestor: '',
    status_campanha: 'Preenchimento do Formulário',
    data_venda: new Date().toISOString().split('T')[0]
  })

  // Lista de gestores disponíveis
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

  const instructions = `Olá ${formData.nome_cliente || '[Nome do Cliente]'},

1. Acesse o link: https://login.trafegoporcents.com
2. Clique em "Criar Conta"
3. Use este mesmo e-mail: ${formData.email_cliente || '[Email do Cliente]'}
4. Escolha uma senha segura
5. Após o cadastro, você verá o painel com os materiais e campanhas

Qualquer dúvida, entre em contato conosco!`

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
    console.log('🚀 [AdicionarClienteAdmin] === INICIANDO PROCESSO ===')
    
    // Validações
    if (!formData.nome_cliente || !formData.telefone || !formData.email_cliente) {
      toast({
        title: "Erro",
        description: "Nome, telefone e email são obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (!formData.email_gestor) {
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
      console.log('📝 [AdicionarClienteAdmin] Dados para inserir:', formData)

      // Preparar dados para inserção
      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        vendedor: formData.vendedor || 'Admin',
        email_gestor: formData.email_gestor,
        status_campanha: formData.status_campanha,
        data_venda: formData.data_venda,
        valor_comissao: 60.00,
        comissao_paga: false,
        site_status: 'pendente',
        saque_solicitado: false
      }

      console.log('📤 [AdicionarClienteAdmin] Enviando para Supabase:', clienteData)

      // Inserir no Supabase
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([clienteData])
        .select()
        .single()

      if (error) {
        console.error('❌ [AdicionarClienteAdmin] Erro ao inserir:', error)
        throw new Error(`Erro ao adicionar cliente: ${error.message}`)
      }

      console.log('✅ [AdicionarClienteAdmin] Cliente criado com sucesso:', data)

      // Limpar formulário
      setFormData({
        nome_cliente: '',
        telefone: '',
        email_cliente: '',
        vendedor: '',
        email_gestor: '',
        status_campanha: 'Preenchimento do Formulário',
        data_venda: new Date().toISOString().split('T')[0]
      })

      setOpen(false)
      onClienteAdicionado()

      toast({
        title: "Cliente Adicionado!",
        description: "Cliente cadastrado com sucesso. Envie as instruções para o cliente criar a conta.",
        duration: 5000
      })

    } catch (error: any) {
      console.error('💥 [AdicionarClienteAdmin] Erro:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Só mostrar para admins
  if (!isAdmin) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente (Admin)</DialogTitle>
        </DialogHeader>
        
        {/* INSTRUÇÕES PARA O CLIENTE */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-yellow-800">📋 Instruções para enviar ao cliente</h3>
            <Button
              onClick={handleCopy}
              size="sm"
              className="ml-2"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          <div className="bg-white border rounded p-3 text-sm text-gray-800">
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {instructions}
            </pre>
          </div>
          <p className="text-yellow-700 text-xs mt-2">
            💡 Após cadastrar o cliente, envie essas instruções via WhatsApp
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
            <Select value={formData.email_gestor} onValueChange={(value) => setFormData(prev => ({ ...prev, email_gestor: value }))}>
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

          <div className="grid gap-2">
            <Label htmlFor="vendedor">Vendedor</Label>
            <Input
              id="vendedor"
              value={formData.vendedor}
              onChange={(e) => setFormData(prev => ({ ...prev, vendedor: e.target.value }))}
              placeholder="Nome do vendedor"
            />
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
  )
}
