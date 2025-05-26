
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
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-white">
            Painel do Vendedor
          </h1>
          <p className="text-gray-300 mt-1">
            Olá, {currentManagerName} ({user?.email})
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalClientes}</div>
              <p className="text-xs text-gray-400">clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Comissão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {(totalClientes * 20).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">R$ 20,00 por cliente</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">Status</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Ativo</div>
              <p className="text-xs text-gray-400">Sistema funcionando</p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar Cliente */}
        {!showForm && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button onClick={() => setShowForm(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Novo Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        {showForm && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Novo Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-gray-200">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoCliente.nome_cliente}
                      onChange={(e) => setNovoCliente({ ...novoCliente, nome_cliente: e.target.value })}
                      placeholder="Nome do cliente"
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone" className="text-gray-200">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-200">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email_cliente}
                      onChange={(e) => setNovoCliente({ ...novoCliente, email_cliente: e.target.value })}
                      placeholder="cliente@email.com"
                      required
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gestor" className="text-gray-200">Gestor Responsável *</Label>
                    <Select value={novoCliente.email_gestor} onValueChange={(value) => setNovoCliente({ ...novoCliente, email_gestor: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecione o gestor" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {gestores.map((gestor) => (
                          <SelectItem key={gestor} value={gestor} className="text-white hover:bg-gray-600">
                            {gestor.split('@')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                    {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-gray-600 text-gray-200 hover:bg-gray-700">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista Simples de Clientes */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Meus Clientes ({totalClientes})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-300">Carregando...</p>
            ) : clientes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Nenhum cliente cadastrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{cliente.nome_cliente}</h3>
                        <p className="text-sm text-gray-300">{cliente.email_cliente}</p>
                        <p className="text-sm text-gray-300">{cliente.telefone}</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          {cliente.status_campanha || 'Brief'}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
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
