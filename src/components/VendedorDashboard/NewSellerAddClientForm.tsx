
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { useSimpleSellerData } from '@/hooks/useSimpleSellerData'

export function NewSellerAddClientForm() {
  const { user } = useAuth()
  const { addCliente, refetch } = useSimpleSellerData(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_cliente: '',
    email_cliente: '',
    telefone: '',
    produto_nicho: '',
    senha: 'parceriadesucesso'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome_cliente || !formData.email_cliente || !formData.telefone || !formData.produto_nicho) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
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
      
      const clienteData = {
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        email_cliente: formData.email_cliente,
        email_gestor: user?.email || '', // Vendedor como responsável
        status_campanha: 'Brief',
        data_venda: new Date().toISOString().split('T')[0],
        produto_nicho: formData.produto_nicho,
        senha_cliente: formData.senha
      }

      console.log("🔵 [NewSellerAddClientForm] Dados para adicionar:", clienteData)

      const result = await addCliente(clienteData)
      
      if (result && result.success) {
        console.log("🟢 [NewSellerAddClientForm] === CLIENTE CRIADO COM SUCESSO ===")
        
        // Limpar formulário
        setFormData({
          nome_cliente: '',
          email_cliente: '',
          telefone: '',
          produto_nicho: '',
          senha: 'parceriadesucesso'
        })
        
        // Recarregar dados
        await refetch()
        
        // Mostrar mensagem de sucesso com credenciais
        toast({
          title: "✅ Cliente criado com sucesso!",
          description: `Cliente: ${formData.nome_cliente}\nE-mail: ${formData.email_cliente}\nSenha: ${formData.senha}`,
          duration: 8000
        })
        
      } else {
        console.error("❌ [NewSellerAddClientForm] Resultado indica falha:", result)
        toast({
          title: "Erro",
          description: "Erro ao criar cliente",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('💥 [NewSellerAddClientForm] Erro ao criar cliente:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
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
            <Label htmlFor="produto_nicho">Produto ou Nicho *</Label>
            <Input
              id="produto_nicho"
              value={formData.produto_nicho}
              onChange={(e) => setFormData(prev => ({ ...prev, produto_nicho: e.target.value }))}
              placeholder="Tráfego para Loja Fitness"
              required
            />
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
            <Label htmlFor="responsavel">Responsável</Label>
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando Cliente..." : "Criar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
