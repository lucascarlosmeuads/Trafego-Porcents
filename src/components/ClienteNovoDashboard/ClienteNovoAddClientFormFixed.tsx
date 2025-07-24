import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useClienteNovoSellerDataMegaFixed } from '@/hooks/useClienteNovoSellerDataMegaFixed'
import { supabase } from '@/integrations/supabase/client'
import { Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react'
import { ClienteNovoCommissionCalculator } from '../ClienteNovoCommissionCalculator'
import { useVendedores } from '@/hooks/useVendedores'

interface GestorOption {
  nome: string
  email: string
}

interface ClienteNovoAddClientFormFixedProps {
  onClientAdded?: () => void
}

export function ClienteNovoAddClientFormFixed({ onClientAdded }: ClienteNovoAddClientFormFixedProps) {
  const { user } = useAuth()
  const { vendedores } = useVendedores()
  const { addCliente } = useClienteNovoSellerDataMegaFixed(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [gestores, setGestores] = useState<GestorOption[]>([])
  const [copied, setCopied] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [lastSuccess, setLastSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    email_cliente: '',
    telefone: '',
    senha: 'parceriadesucesso',
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
          console.error('❌ [ClienteNovoAddClientFormFixed] Erro ao verificar sessão:', error)
          setIsAuthenticated(false)
          return
        }

        if (session && session.user) {
          console.log('✅ [ClienteNovoAddClientFormFixed] Usuário autenticado:', session.user.email)
          setIsAuthenticated(true)
        } else {
          console.log('❌ [ClienteNovoAddClientFormFixed] Usuário não autenticado')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('❌ [ClienteNovoAddClientFormFixed] Erro na verificação de auth:', error)
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
    
    // Log de início do processo
    console.log('🚀 [ClienteNovoAddClientFormFixed] === INICIANDO SUBMISSÃO ===')
    console.log('🚀 [ClienteNovoAddClientFormFixed] Dados do formulário:', formData)
    
    // Verificar autenticação antes de prosseguir
    if (!isAuthenticated) {
      toast({
        title: "❌ Erro de Autenticação",
        description: "Você precisa estar logado para criar clientes. Faça login novamente.",
        variant: "destructive"
      })
      return
    }

    // Validações obrigatórias
    const validacoes = [
      { campo: formData.nome_cliente, nome: 'Nome do cliente' },
      { campo: formData.email_cliente, nome: 'E-mail do cliente' },
      { campo: formData.telefone, nome: 'Telefone' },
      { campo: formData.email_gestor, nome: 'Gestor responsável' },
      { campo: formData.vendedor_responsavel, nome: 'Vendedor responsável' },
      { campo: formData.valor_venda_inicial, nome: 'Valor da venda' },
      { campo: formData.senha, nome: 'Senha' }
    ]

    for (const validacao of validacoes) {
      if (!validacao.campo) {
        toast({
          title: "❌ Campo Obrigatório",
          description: `${validacao.nome} é obrigatório`,
          variant: "destructive"
        })
        return
      }
    }

    setLoading(true)

    try {
      console.log("🆕 [ClienteNovoAddClientFormFixed] === PREPARANDO DADOS ===")
      
      const clienteData = {
        nome_cliente: formData.nome_cliente.trim(),
        telefone: formData.telefone.trim(),
        email_cliente: formData.email_cliente.trim(),
        email_gestor: formData.email_gestor,
        vendedor_responsavel: formData.vendedor_responsavel,
        resumo_conversa_vendedor: formData.resumo_conversa_vendedor.trim(),
        valor_venda_inicial: formData.valor_venda_inicial,
        senha_cliente: formData.senha
      }

      console.log("🆕 [ClienteNovoAddClientFormFixed] Dados processados:", clienteData)

      const result = await addCliente(clienteData)
      
      console.log("🆕 [ClienteNovoAddClientFormFixed] Resultado:", result)
      
      if (result && result.success) {
        console.log("🟢 [ClienteNovoAddClientFormFixed] === SUCESSO TOTAL ===")
        
        // Registrar sucesso
        setLastSuccess(`${clienteData.nome_cliente} - ${new Date().toLocaleString()}`)
        
        // Limpar formulário
        setFormData({
          nome_cliente: '',
          email_cliente: '',
          telefone: '',
          senha: 'parceriadesucesso',
          email_gestor: '',
          vendedor_responsavel: '',
          resumo_conversa_vendedor: '',
          valor_venda_inicial: null,
          valor_comissao: null
        })
        
        // Chamar callback para atualizar dashboards
        if (onClientAdded) {
          console.log("🔄 [ClienteNovoAddClientFormFixed] Chamando callback onClientAdded")
          onClientAdded()
        }
        
        // Toast de sucesso detalhado
        toast({
          title: "🎉 Cliente Processado com Sucesso!",
          description: `✅ ${clienteData.nome_cliente} foi ${result.isNewClient ? 'criado' : 'atualizado'}
📧 E-mail: ${clienteData.email_cliente}
🔐 Senha: ${clienteData.senha_cliente}
💰 Comissão: R$ ${result.valorComissao}
👤 Vendedor: ${formData.vendedor_responsavel}
🎯 Gestor: ${formData.email_gestor}

O cliente pode fazer login em: https://login.trafegoporcents.com`,
          duration: 10000
        })
        
        console.log("🎉 [ClienteNovoAddClientFormFixed] Processo 100% completo!")
        
      } else {
        console.error("❌ [ClienteNovoAddClientFormFixed] Falha no resultado:", result)
        toast({
          title: "❌ Falha na Criação",
          description: "O processo falhou. Verifique os logs e tente novamente com dados diferentes.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('💥 [ClienteNovoAddClientFormFixed] Erro crítico:', error)
      toast({
        title: "💥 Erro Crítico",
        description: `Erro inesperado: ${error.message}. Contate o suporte técnico.`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateClientWelcomeMessage = () => {
    const clienteName = formData.nome_cliente || '[Nome do Cliente]'
    const clienteEmail = formData.email_cliente || '[Email do Cliente]'
    const clienteSenha = formData.senha || 'parceriadesucesso'
    
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
        title: "📋 Copiado!",
        description: "Mensagem de boas-vindas copiada para enviar ao cliente"
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive"
      })
    }
  }

  const handleTestFill = () => {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    
    setFormData(prev => ({
      ...prev,
      nome_cliente: `Cliente Teste ${timestamp}`,
      email_cliente: `teste${timestamp}${randomNum}@clientenovo.com`,
      telefone: '(11) 99999-9999',
      email_gestor: gestores[0]?.email || '',
      vendedor_responsavel: vendedores[0]?.nome || '',
      valor_venda_inicial: 500,
      senha: 'parceriadesucesso',
      resumo_conversa_vendedor: `Teste automatizado - Cliente interessado em tráfego pago. Criado em ${new Date().toLocaleString()}`
    }))
    
    toast({
      title: "🚀 Teste Preenchido!",
      description: `Dados únicos gerados: Cliente${timestamp}`,
      duration: 3000
    })
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
        <CardTitle>🆕 Cliente Novo - Sistema Corrigido</CardTitle>
        <CardDescription>
          ✅ Vendedor: R$ 40 (venda R$ 500) | R$ 30 (venda R$ 350) • Gestor: R$ 150 (venda R$ 500) | R$ 80 (venda R$ 350)
        </CardDescription>
        {lastSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Último sucesso: {lastSuccess}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Botão de teste melhorado */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestFill}
              className="text-xs"
            >
              🧪 Preencher Teste Único
            </Button>
            <div className="text-xs text-muted-foreground flex items-center">
              Gera dados únicos para teste
            </div>
          </div>

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
              Senha padrão: <strong>parceriadesucesso</strong>
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
            {loading ? "🔄 Criando Cliente..." : "🚀 Criar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}