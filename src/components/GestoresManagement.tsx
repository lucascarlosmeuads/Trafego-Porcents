import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Check, X, UserPlus, UserMinus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/useAuth'
import { type Gestor } from '@/types/gestor'

export function GestoresManagement() {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    pode_adicionar_cliente: false
  })
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Só busca gestores se a autenticação já carregou e há um usuário logado
    if (!authLoading && user) {
      fetchGestores()
    } else if (!authLoading && !user) {
      // Se não há usuário, para o loading
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchGestores = async () => {
    try {
      console.log('🔍 Buscando gestores...')
      const { data, error } = await supabase
        .from('gestores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar gestores:', error)
        throw error
      }

      // Garantir que sempre temos um array, mesmo se data for null/undefined
      const gestoresData = data ?? []
      console.log('✅ Gestores carregados:', gestoresData.length, 'registros')
      setGestores(gestoresData)
    } catch (error: any) {
      console.error('💥 Erro ao carregar gestores:', error)
      
      // Só mostra toast de erro se for um erro real, não de permissão na inicialização
      if (!error?.message?.includes('permission denied')) {
        toast({
          title: "Erro",
          description: "Erro ao carregar gestores",
          variant: "destructive"
        })
      }
      
      // Define array vazio em caso de erro
      setGestores([])
    } finally {
      setLoading(false)
    }
  }

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
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado')
      }

      // Call the edge function to create the user
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

      // Verify the response has the expected data with the new format
      if (!result.success || !result.user) {
        throw new Error('Resposta inválida do servidor')
      }

      toast({
        title: "Sucesso",
        description: "Gestor criado com sucesso"
      })

      setModalOpen(false)
      setFormData({ nome: '', email: '', senha: '', pode_adicionar_cliente: false })
      fetchGestores()
    } catch (error: any) {
      console.error('Erro ao criar gestor:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar gestor",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const togglePermissao = async (gestorId: string, currentPermission: boolean) => {
    try {
      const { error } = await supabase
        .from('gestores')
        .update({ pode_adicionar_cliente: !currentPermission })
        .eq('id', gestorId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Permissão ${!currentPermission ? 'concedida' : 'revogada'} com sucesso`
      })

      fetchGestores()
    } catch (error) {
      console.error('Erro ao alterar permissão:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar permissão",
        variant: "destructive"
      })
    }
  }

  const toggleStatus = async (gestorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('gestores')
        .update({ ativo: !currentStatus })
        .eq('id', gestorId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Gestor ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      })

      fetchGestores()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar status",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Mostra loading se ainda está carregando autenticação ou gestores
  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-8">Carregando gestores...</div>
  }

  // Se não há usuário autenticado, não mostra nada
  if (!user) {
    return <div className="flex items-center justify-center py-8">Acesso não autorizado</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Gerenciamento de Gestores</CardTitle>
            </div>
            
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pode Adicionar Cliente</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gestores.map((gestor) => (
                <TableRow key={gestor.id}>
                  <TableCell className="font-medium">{gestor.nome}</TableCell>
                  <TableCell>{gestor.email}</TableCell>
                  <TableCell>
                    <Badge variant={gestor.ativo ? "default" : "secondary"}>
                      {gestor.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={gestor.pode_adicionar_cliente ? "default" : "outline"}>
                      {gestor.pode_adicionar_cliente ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(gestor.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={gestor.pode_adicionar_cliente ? "destructive" : "default"}
                        onClick={() => togglePermissao(gestor.id, gestor.pode_adicionar_cliente)}
                      >
                        {gestor.pode_adicionar_cliente ? (
                          <>
                            <UserMinus className="w-3 h-3 mr-1" />
                            Revogar
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Permitir
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(gestor.id, gestor.ativo)}
                      >
                        {gestor.ativo ? (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {gestores.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum gestor encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
