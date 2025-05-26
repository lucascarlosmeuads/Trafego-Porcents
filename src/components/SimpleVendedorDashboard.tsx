
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Plus, Users, DollarSign } from 'lucide-react'
import { useSimpleSellerData } from '@/hooks/useSimpleSellerData'

export function SimpleVendedorDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, totalClientes, loading, addCliente, refetch } = useSimpleSellerData(user?.email || '')
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [novoCliente, setNovoCliente] = useState({
    nome_cliente: '',
    telefone: '',
    email_cliente: '',
    email_gestor: ''
  })

  const gestores = [
    'jose@trafegoporcents.com',
    'falcao@trafegoporcents.com', 
    'rullian@trafegoporcents.com',
    'danielribeiro@trafegoporcents.com',
    'danielmoreira@trafegoporcents.com',
    'carol@trafegoporcents.com',
    'guilherme@trafegoporcents.com',
    'emily@trafegoporcents.com',
    'leandrodrumzique@trafegoporcents.com',
    'kimberlly@trafegoporcents.com',
    'junior@trafegoporcents.com',
    'kely@trafegoporcents.com',
    'jefferson@trafegoporcents.com'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!novoCliente.nome_cliente || !novoCliente.telefone || !novoCliente.email_cliente || !novoCliente.email_gestor) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await addCliente(novoCliente)
      
      if (result.success) {
        setNovoCliente({
          nome_cliente: '',
          telefone: '',
          email_cliente: '',
          email_gestor: ''
        })
        setShowForm(false)
        toast({
          title: "Cliente cadastrado!",
          description: `${novoCliente.nome_cliente} foi adicionado com sucesso.`
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNovoCliente({
      nome_cliente: '',
      telefone: '',
      email_cliente: '',
      email_gestor: ''
    })
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Painel do Vendedor
          </h1>
          <p className="text-gray-600">
            Olá, {currentManagerName} ({user?.email})
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <p className="text-xs text-muted-foreground">clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(totalClientes * 20).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">R$ 20,00 por cliente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Ativo</div>
              <p className="text-xs text-muted-foreground">Sistema funcionando</p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar Cliente */}
        {!showForm && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Button onClick={() => setShowForm(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Novo Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoCliente.nome_cliente}
                      onChange={(e) => setNovoCliente({ ...novoCliente, nome_cliente: e.target.value })}
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email_cliente}
                      onChange={(e) => setNovoCliente({ ...novoCliente, email_cliente: e.target.value })}
                      placeholder="cliente@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gestor">Gestor Responsável *</Label>
                    <Select value={novoCliente.email_gestor} onValueChange={(value) => setNovoCliente({ ...novoCliente, email_gestor: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        {gestores.map((gestor) => (
                          <SelectItem key={gestor} value={gestor}>
                            {gestor.split('@')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista Simples de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Clientes ({totalClientes})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : clientes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum cliente cadastrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{cliente.nome_cliente}</h3>
                        <p className="text-sm text-gray-600">{cliente.email_cliente}</p>
                        <p className="text-sm text-gray-600">{cliente.telefone}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {cliente.status_campanha || 'Brief'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          R$ 20,00 comissão
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
