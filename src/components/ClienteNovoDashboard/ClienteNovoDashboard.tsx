import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteNovoSellerData } from '@/hooks/useClienteNovoSellerData'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, TrendingUp, Star } from 'lucide-react'
import { ClienteNovoSidebar } from './ClienteNovoSidebar'
import { ClienteNovoAddClientForm } from './ClienteNovoAddClientForm'
import { ClienteNovoClientsList } from './ClienteNovoClientsList'

export function ClienteNovoDashboard() {
  const { user, currentManagerName } = useAuth()
  const { clientes, totalClientes, loading, refetch } = useClienteNovoSellerData(user?.email || '')
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleClientAdded = async () => {
    await refetch()
    setActiveTab('clientes')
  }

  // Calcular métricas simples
  const clientesHoje = clientes.filter(cliente => {
    const hoje = new Date().toISOString().split('T')[0]
    return cliente.created_at.split('T')[0] === hoje
  }).length

  const clientesSemana = clientes.filter(cliente => {
    const agora = new Date()
    const clienteData = new Date(cliente.created_at)
    const diffTime = agora.getTime() - clienteData.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

  const clientesMes = clientes.filter(cliente => {
    const agora = new Date()
    const clienteData = new Date(cliente.created_at)
    return agora.getMonth() === clienteData.getMonth() && 
           agora.getFullYear() === clienteData.getFullYear()
  }).length

  const renderContent = () => {
    switch (activeTab) {
      case 'adicionar-cliente':
        return <ClienteNovoAddClientForm onClientAdded={handleClientAdded} />
      case 'clientes':
        return (
          <ClienteNovoClientsList 
            clientes={clientes}
            loading={loading}
            totalClientes={totalClientes}
          />
        )
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Cliente Novo</h1>
              <p className="text-muted-foreground">
                Olá, {currentManagerName}! Sistema de comissões fixas para vendas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClientes}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientesHoje}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes criados hoje
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientesSemana}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientesMes}</div>
                  <p className="text-xs text-muted-foreground">
                    Clientes no mês atual
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Sistema de Comissões Fixas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Venda de R$ 500</span>
                      <span className="font-bold text-green-600">R$ 150 de comissão</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Venda de R$ 350</span>
                      <span className="font-bold text-blue-600">R$ 80 de comissão</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      As comissões são aplicadas automaticamente conforme o valor da venda selecionado. 
                      Não é possível alterar os valores manualmente.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Instruções de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <p>Use a aba <strong>"Adicionar Cliente"</strong> para criar novos cadastros</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <p>Selecione R$ 350 ou R$ 500 como valor da venda</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <p>A comissão será calculada automaticamente</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">4</span>
                      </div>
                      <p>Copie a mensagem pronta para enviar ao cliente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ClienteNovoSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}