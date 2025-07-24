import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useClienteNovoSellerData } from '@/hooks/useClienteNovoSellerData'
import { supabase } from '@/integrations/supabase/client'
import { Copy, Check, AlertTriangle } from 'lucide-react'
import { ClienteNovoCommissionCalculator } from '../ClienteNovoCommissionCalculator'
import { useVendedores } from '@/hooks/useVendedores'

interface GestorOption {
  nome: string
  email: string
}

interface ClienteNovoAddClientFormProps {
  onClientAdded?: () => void
}

export function ClienteNovoAddClientForm({ onClientAdded }: ClienteNovoAddClientFormProps) {
  const { user } = useAuth()
  const { vendedores } = useVendedores()
  const { addCliente } = useClienteNovoSellerData(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [gestores, setGestores] = useState<GestorOption[]>([])
  const [copied, setCopied] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    email_cliente: '',
    telefone: '',
    senha: 'clientenovo',
    email_gestor: '',
    vendedor_responsavel: '',
    resumo_conversa_vendedor: '',
    valor_venda_inicial: null as number | null,
    valor_comissao: null as number | null
  })

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [ClienteNovoAddClientForm] Erro ao verificar sessão:', error)
          setIsAuthenticated(false)
          return
        }

        if (session && session.user) {
          console.log('✅ [ClienteNovoAddClientForm] Usuário autenticado:', session.user.email)
          setIsAuthenticated(true)
        } else {
          console.log('❌ [ClienteNovoAddClientForm] Usuário não autenticado')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('❌ [ClienteNovoAddClientForm] Erro na verificação de auth:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [user])

  // Buscar gestores disponíveis
  useEffect(() => {
    const fetchGestores = async () => {
      try {
        const { data, error } = await supabase
          .from('gestores')
          .select('nome, email')
          .eq('ativo', true)
          .order('nome')

        if (error) {
          console.error('Erro ao buscar gestores:', error)
          return
        }

        const gestoresFormatados = (data || []).map(gestor => ({
          nome: gestor.nome,
          email: gestor.email
        }))

        setGestores(gestoresFormatados)
        console.log('✅ Gestores carregados:', gestoresFormatados.length)
      } catch (error) {
        console.error('Erro ao carregar gestores:', error)
      }
    }

    if (isAuthenticated) {
      fetchGestores()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar autenticação antes de prosseguir
    if (!isAuthenticated) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para criar clientes. Faça login novamente.",
        variant: "destructive"
      })
      return
    }

    if (!formData.nome_cliente || !formData.email_cliente || !formData.telefone) {
      toast({
        title: "Erro",
        description: "Nome, e-mail e telefone são obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (!formData.email_gestor) {
      toast({
        title: "Erro",
        description: "Selecione um gestor responsável",
        variant: "destructive"
      })
      return
    }

    if (!formData.vendedor_responsavel) {
      toast({
        title: "Erro",
        description: "Selecione um vendedor responsável",
        variant: "destructive"
      })
      return
    }

    if (!formData.valor_venda_inicial) {
      toast({
        title: "Erro",
        description: "Selecione o valor da venda (R$ 350 ou R$ 500)",
        variant: "destructive"
      })
      return
    }

    if (!formData.senha) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      console.log("🆕 [ClienteNovoAddClientForm] === INICIANDO PROCESSO ===")
      console.log("🆕 [ClienteNovoAddClientForm] Dados do formulário:", formData)
      
      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        email_gestor: formData.email_gestor,
        vendedor_responsavel: formData.vendedor_responsavel,
        resumo_conversa_vendedor: formData.resumo_conversa_vendedor,
        valor_venda_inicial: formData.valor_venda_inicial,
        senha_cliente: formData.senha
      }

      console.log("🆕 [ClienteNovoAddClientForm] Dados para addCliente:", clienteData)

      const result = await addCliente(clienteData)
      
      console.log("🆕 [ClienteNovoAddClientForm] Resultado do addCliente:", result)
      
      if (result && typeof result === 'object' && result.success) {
        console.log("🟢 [ClienteNovoAddClientForm] === CLIENTE CRIADO COM SUCESSO ===")
        
        // Limpar formulário
        setFormData({
          nome_cliente: '',
          email_cliente: '',
          telefone: '',
          senha: 'clientenovo',
          email_gestor: '',
          vendedor_responsavel: '',
          resumo_conversa_vendedor: '',
          valor_venda_inicial: null,
          valor_comissao: null
        })
        
        // Chamar callback para atualizar a lista no dashboard pai
        if (onClientAdded) {
          console.log("🔄 [ClienteNovoAddClientForm] Chamando callback onClientAdded")
          onClientAdded()
        }
        
        // Mostrar mensagem de sucesso
        toast({
          title: "✅ Cliente criado com sucesso!",
          description: `Cliente: ${clienteData.nome_cliente}
E-mail: ${clienteData.email_cliente}
Senha: ${clienteData.senha_cliente}
Vendedor: ${formData.vendedor_responsavel}
Gestor: ${formData.email_gestor}
Comissão: R$ ${result.valorComissao}

O cliente pode fazer login imediatamente com essas credenciais.`,
          duration: 10000
        })
        
        console.log("🎉 [ClienteNovoAddClientForm] Processo completo - cliente pode fazer login!")
        
      } else {
        console.error("❌ [ClienteNovoAddClientForm] Resultado indica falha:", result)
        toast({
          title: "Erro",
          description: "Erro ao criar cliente - verifique os dados e tente novamente",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('💥 [ClienteNovoAddClientForm] Erro ao criar cliente:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado ao criar cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateClientWelcomeMessage = () => {
    const clienteName = formData.nome_cliente || '[Nome do Cliente]'
    const clienteEmail = formData.email_cliente || '[Email do Cliente]'
    const clienteSenha = formData.senha || 'clientenovo'
    
    return `Olá ${clienteName}! 🎉

Conta criada com sucesso! Para acessar aqui está seu email e sua senha:

📧 Email: ${clienteEmail}
🔐 Senha: ${clienteSenha}

🔗 Acesse: https://login.trafegoporcents.com

Esse processo completo leva até 15 dias úteis, justamente pra garantir que tudo saia alinhado com seu público e com os melhores resultados.

Mas fica tranquilo que dependendo do seu projeto é bem mais rápido que isso, pedimos esse prazo pra garantirmos que não vamos atrasar e que vamos fazer com qualidade. Vou te atualizando em cada etapa, e qualquer dúvida ou ideia que surgir, estamos por aqui!

O passo a passo com as instruções vai estar logo na primeira tela assim que logar. Seja bem-vindo!

⏰ Aguarde 1 dia pela criação do grupo. Se não for criado hoje, no máximo no outro dia cedo será criado. Fique tranquilo! 

Qualquer dúvida, estamos aqui para ajudar! 💪`
  }

  const handleCopyWelcomeMessage = async () => {
    const message = generateClientWelcomeMessage()
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      toast({
        title: "Copiado!",
        description: "Mensagem de boas-vindas copiada para enviar ao cliente"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive"
      })
    }
  }

  // Se não estiver autenticado, mostrar aviso
  if (!isAuthenticated) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Autenticação Necessária
          </CardTitle>
          <CardDescription>
            Você precisa estar logado para criar novos clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Para criar clientes, você deve estar autenticado no sistema. 
              Faça login novamente ou verifique sua conexão.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Novo Cliente - Comissões Fixas</CardTitle>
        <CardDescription>
          Sistema Cliente Novo: Comissões automáticas de R$ 150 (venda R$ 500) ou R$ 80 (venda R$ 350)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
            <Input
              id="nome_cliente"
              value={formData.nome_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_cliente: e.target.value }))}
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email_cliente">E-mail do Cliente *</Label>
            <Input
              id="email_cliente"
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData(prev => ({ ...prev, email_cliente: e.target.value }))}
              placeholder="cliente@email.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email_gestor">Gestor Responsável *</Label>
            <Select value={formData.email_gestor} onValueChange={(value) => setFormData(prev => ({ ...prev, email_gestor: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um gestor" />
              </SelectTrigger>
              <SelectContent>
                {gestores.map((gestor) => (
                  <SelectItem key={gestor.email} value={gestor.email}>
                    {gestor.nome} ({gestor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vendedor_responsavel">Vendedor Responsável *</Label>
            <Select value={formData.vendedor_responsavel} onValueChange={(value) => setFormData(prev => ({ ...prev, vendedor_responsavel: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor.nome} value={vendedor.nome}>
                    {vendedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calculadora de Comissão Cliente Novo */}
          <ClienteNovoCommissionCalculator
            saleValue={formData.valor_venda_inicial}
            commissionValue={formData.valor_comissao}
            onSaleValueChange={(value) => setFormData(prev => ({ ...prev, valor_venda_inicial: value }))}
            onCommissionChange={(value) => setFormData(prev => ({ ...prev, valor_comissao: value }))}
          />

          <div className="grid gap-2">
            <Label htmlFor="resumo_conversa_vendedor">Resumo da Conversa com o Cliente</Label>
            <Textarea
              id="resumo_conversa_vendedor"
              value={formData.resumo_conversa_vendedor}
              onChange={(e) => setFormData(prev => ({ ...prev, resumo_conversa_vendedor: e.target.value }))}
              placeholder="Descreva brevemente como foi a conversa com o cliente, principais objeções superadas, expectativas demonstradas, etc."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              📝 Campo opcional. Este resumo ajudará o gestor a entender melhor o contexto da venda.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="text"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              required
            />
            <p className="text-sm text-muted-foreground">
              Se não quiser alterar, a senha padrão será <strong>clientenovo</strong>.
            </p>
          </div>


          {/* Mensagem personalizada para o cliente */}
          {formData.nome_cliente && formData.email_cliente && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-800 text-sm">📱 Mensagem para enviar ao cliente:</h3>
                <Button
                  type="button"
                  onClick={handleCopyWelcomeMessage}
                  size="sm"
                  variant={copied ? "default" : "outline"}
                  className="text-xs"
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
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {generateClientWelcomeMessage()}
                </pre>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando Cliente..." : "Criar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}