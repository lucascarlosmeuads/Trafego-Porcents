
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface GestorFormModalProps {
  onGestorCreated: () => void
}

export function GestorFormModal({ onGestorCreated }: GestorFormModalProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    pode_adicionar_cliente: false
  })
  const { toast } = useToast()

  const handleCreateGestor = async () => {
    if (!formData.nome || !formData.email || !formData.senha) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (!formData.email.endsWith('@trafegoporcents.com')) {
      toast({
        title: "Erro",
        description: "Email deve terminar com @trafegoporcents.com",
        variant: "destructive"
      })
      return
    }

    setCreating(true)
    try {
      console.log('🚀 [GESTORES] Criando novo gestor com sincronização total:', formData.nome, formData.email)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado')
      }

      toast({
        title: "Processando...",
        description: "Criando gestor no sistema e configurando acesso..."
      })

      const response = await fetch(`https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/create-gestor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          pode_adicionar_cliente: formData.pode_adicionar_cliente
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar gestor')
      }

      if (!result.success || !result.user) {
        throw new Error('Resposta inválida do servidor')
      }

      console.log('✅ [GESTORES] Sincronização completa realizada!')
      console.log('👤 [GESTORES] Usuário criado no Auth:', result.user.id)
      console.log('📊 [GESTORES] Gestor criado na tabela:', result.gestor.id)
      
      toast({
        title: "✅ Sincronização Completa",
        description: `${formData.nome} foi criado(a) no sistema e já pode fazer login!`
      })

      setModalOpen(false)
      setFormData({ nome: '', email: '', senha: '', pode_adicionar_cliente: false })
      
      setTimeout(() => {
        onGestorCreated()
      }, 1000)
    } catch (error: any) {
      console.error('💥 [GESTORES] Erro na sincronização:', error)
      toast({
        title: "❌ Erro na Sincronização",
        description: error.message || "Erro ao criar gestor e configurar acesso",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Novo Gestor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Gestor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do gestor"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="gestor@trafegoporcents.com"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              placeholder="Senha do gestor"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="permissao"
              checked={formData.pode_adicionar_cliente}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pode_adicionar_cliente: checked }))}
            />
            <Label htmlFor="permissao">Permitir adicionar clientes</Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleCreateGestor} 
              className="flex-1"
              disabled={creating}
            >
              {creating ? 'Criando...' : 'Criar Gestor'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
