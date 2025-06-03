
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useSimpleSellerData } from '@/hooks/useSimpleSellerData'
import { supabase } from '@/integrations/supabase/client'
import { Copy, Check, AlertTriangle } from 'lucide-react'

interface GestorOption {
  nome: string
  email: string
}

interface NewSellerAddClientFormProps {
  onClientAdded?: () => void
}

export function NewSellerAddClientForm({ onClientAdded }: NewSellerAddClientFormProps) {
  const { user } = useAuth()
  const { addCliente } = useSimpleSellerData(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [gestores, setGestores] = useState<GestorOption[]>([])
  const [copied, setCopied] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    email_cliente: '',
    telefone: '',
    senha: 'parceriadesucesso',
    email_gestor: ''
  })

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [NewSellerAddClientForm] Erro ao verificar sessão:', error)
          setIsAuthenticated(false)
          return
        }

        if (session && session.user) {
          console.log('✅ [NewSellerAddClientForm] Usuário autenticado:', session.user.email)
          setIsAuthenticated(true)
        } else {
          console.log('❌ [NewSellerAddClientForm] Usuário não autenticado')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('❌ [NewSellerAddClientForm] Erro na verificação de auth:', error)
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
      console.log("🔵 [NewSellerAddClientForm] === INICIANDO PROCESSO ===")
      console.log("🔵 [NewSellerAddClientForm] Dados do formulário:", formData)
      
      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        email_gestor: formData.email_gestor,
        status_campanha: 'Cliente Novo',
        data_venda: new Date().toISOString().split('T')[0],
        produto_nicho: 'Tráfego Pago',
        senha_cliente: formData.senha,
        valor_comissao: 60.00
      }

      console.log("🔵 [NewSellerAddClientForm] Dados para addCliente:", clienteData)

      const result = await addCliente(clienteData)
      
      console.log("🔵 [NewSellerAddClientForm] Resultado do addCliente:", result)
      
      if (result && typeof result === 'object' && result.success) {
        console.log("🟢 [NewSellerAddClientForm] === CLIENTE CRIADO COM SUCESSO ===")
        
        // Limpar formulário
        setFormData({
          nome_cliente: '',
          email_cliente: '',
          telefone: '',
          senha: 'parceriadesucesso',
          email_gestor: ''
        })
        
        // Chamar callback para atualizar a lista no dashboard pai
        if (onClientAdded) {
          console.log("🔄 [NewSellerAddClientForm] Chamando callback onClientAdded")
          onClientAdded()
        }
        
        // Mostrar mensagem de sucesso
        toast({
          title: "✅ Cliente criado com sucesso!",
          description: `Cliente: ${clienteData.nome_cliente}
E-mail: ${clienteData.email_cliente}
Senha: ${clienteData.senha_cliente}
Gestor: ${formData.email_gestor}

O cliente pode fazer login imediatamente com essas credenciais.`,
          duration: 10000
        })
        
        console.log("🎉 [NewSellerAddClientForm] Processo completo - cliente pode fazer login!")
        
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
        
      } else {
        console.error("❌ [NewSellerAddClientForm] Resultado indica falha:", result)
        toast({
          title: "Erro",
          description: "Erro ao criar cliente - verifique os dados e tente novamente",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('💥 [NewSellerAddClientForm] Erro ao criar cliente:', error)
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
    const clienteSenha = formData.senha || 'parceriadesucesso'
    
    return `Olá ${clienteName}! 🎉

Conta criada com sucesso! Para acessar aqui está seu email e sua senha:

📧 Email: ${clienteEmail}
🔐 Senha: ${clienteSenha}

🔗 Acesse: https://login.trafegoporcents.com

💬 IMPORTANTE: Após fazer login, entre em contato via chat no sistema para ser atendido pelo seu gestor auxiliar que vai montar sua estratégia personalizada baseada na estratégia oficial da Tráfego Porcents.

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
        <CardTitle>Adicionar Novo Cliente</CardTitle>
        <CardDescription>
          Preencha os dados do cliente para criar uma nova conta
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
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="text"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              required
            />
            <p className="text-sm text-muted-foreground">
              Se não quiser alterar, a senha padrão será <strong>parceriadesucesso</strong>.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="responsavel">Vendedor</Label>
            <Input
              id="responsavel"
              value={user?.email || ''}
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm text-muted-foreground">
              Preenchido automaticamente com seu e-mail
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
