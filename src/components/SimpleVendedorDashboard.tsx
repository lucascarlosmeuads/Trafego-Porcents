import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Plus, Users, DollarSign, Calendar, Filter } from 'lucide-react'
import { useSimpleSellerData } from '@/hooks/useSimpleSellerData'
import { useSimpleClientFilters } from '@/hooks/useSimpleClientFilters'

export function SimpleVendedorDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, totalClientes, loading, addCliente, refetch } = useSimpleSellerData(user?.email || '')
  const { dateFilter, setDateFilter, organizedClientes } = useSimpleClientFilters(clientes)
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

  // Lógica de filtro conforme solicitado
  const getFilteredClients = () => {
    let listaFiltrada = []
    if (dateFilter === "today") {
      listaFiltrada = organizedClientes.hoje
    } else if (dateFilter === "yesterday") {
      listaFiltrada = organizedClientes.ontem
    } else if (dateFilter === "last7days") {
      listaFiltrada = organizedClientes.ultimos7Dias
    } else if (dateFilter === "thisMonth") {
      listaFiltrada = organizedClientes.total.filter(cliente => {
        const data = new Date(cliente.created_at)
        const hoje = new Date()
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear()
      })
    } else if (dateFilter === "thisYear") {
      listaFiltrada = organizedClientes.total.filter(cliente => {
        const data = new Date(cliente.created_at)
        const hoje = new Date()
        return data.getFullYear() === hoje.getFullYear()
      })
    } else {
      listaFiltrada = organizedClientes.total
    }
    return listaFiltrada
  }

  const clientesFiltrados = getFilteredClients()

  const filterOptions = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'thisMonth', label: 'Este mês' },
    { value: 'thisYear', label: 'Este ano' },
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Painel do Vendedor
          </h1>
          <p className="text-gray-600 mt-1">
            Olá, {currentManagerName} ({user?.email})
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalClientes}</div>
              <p className="text-xs text-gray-500">clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Filtrados</CardTitle>
              <Filter className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{clientesFiltrados.length}</div>
              <p className="text-xs text-gray-500">no período selecionado</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Comissão Filtrada</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                R$ {(clientesFiltrados.length * 20).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">R$ 20,00 por cliente</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label className="text-gray-700">Período:</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-64 bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-900 hover:bg-gray-50">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Adicionar Cliente */}
        {!showForm && (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button onClick={() => setShowForm(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Novo Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        {showForm && (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Novo Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-gray-700">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoCliente.nome_cliente}
                      onChange={(e) => setNovoCliente({ ...novoCliente, nome_cliente: e.target.value })}
                      placeholder="Nome do cliente"
                      required
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone" className="text-gray-700">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email_cliente}
                      onChange={(e) => setNovoCliente({ ...novoCliente, email_cliente: e.target.value })}
                      placeholder="cliente@email.com"
                      required
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gestor" className="text-gray-700">Gestor Responsável *</Label>
                    <Select value={novoCliente.email_gestor} onValueChange={(value) => setNovoCliente({ ...novoCliente, email_gestor: value })}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Selecione o gestor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {gestores.map((gestor) => (
                          <SelectItem key={gestor} value={gestor} className="text-gray-900 hover:bg-gray-50">
                            {gestor.split('@')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista Filtrada de Clientes */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">
              Clientes - {filterOptions.find(f => f.value === dateFilter)?.label} ({clientesFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Carregando...</p>
            ) : clientesFiltrados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum cliente encontrado para o período selecionado
              </p>
            ) : (
              <div className="space-y-3">
                {clientesFiltrados.map((cliente) => (
                  <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cliente.nome_cliente}</h3>
                        <p className="text-sm text-gray-700">{cliente.email_cliente}</p>
                        <p className="text-sm text-gray-700">{cliente.telefone}</p>
                        {cliente.created_at && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
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
