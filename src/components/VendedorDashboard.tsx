
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdicionarClienteModal } from './AdicionarClienteModal'
import { Plus, Users, TrendingUp } from 'lucide-react'

export function VendedorDashboard() {
  const { user, currentManagerName } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleClienteAdicionado = () => {
    console.log('✅ [VendedorDashboard] Cliente adicionado com sucesso')
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-500 rounded-full p-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {currentManagerName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Painel do Vendedor - {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sua Função</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Vendedor</div>
            <p className="text-xs text-muted-foreground">
              Responsável por cadastrar novos clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando normalmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Card */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-500 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl">Adicionar Novo Cliente</CardTitle>
          <CardDescription className="text-base">
            Use o formulário abaixo para cadastrar novos clientes no sistema.
            Selecione o gestor responsável e preencha todas as informações necessárias.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <AdicionarClienteModal onClienteAdicionado={handleClienteAdicionado} />
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Instruções para Vendedores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">1</div>
            <div>
              <p className="font-medium">Preencha os dados do cliente</p>
              <p className="text-sm text-gray-600">Nome completo, telefone e email são obrigatórios</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">2</div>
            <div>
              <p className="font-medium">Selecione o gestor responsável</p>
              <p className="text-sm text-gray-600">Escolha qual gestor ficará responsável pela campanha</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold">3</div>
            <div>
              <p className="font-medium">Envie as instruções para o cliente</p>
              <p className="text-sm text-gray-600">Após cadastrar, envie as instruções de acesso via WhatsApp</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
