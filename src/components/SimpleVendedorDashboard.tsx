
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSimpleSellerData } from '@/hooks/useSimpleSellerData'
import { Users, TrendingUp, DollarSign, LogOut } from 'lucide-react'

export function SimpleVendedorDashboard() {
  const { user, signOut } = useAuth()
  const { clientes, loading } = useSimpleSellerData(user?.email || '')
  const [isSigningOut, setIsSigningOut] = useState(false)

  const totalVendas = clientes.length
  const totalComissao = clientes.reduce((acc, cliente) => acc + 60, 0) // Assuming fixed commission of 60

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Vendedor</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Saindo...' : 'Sair'}
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVendas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Venda</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalVendas > 0 ? (totalComissao / totalVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma venda registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientes.map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{cliente.nome_cliente}</p>
                      <p className="text-sm text-gray-600">{cliente.email_cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ 60,00
                      </p>
                      <p className="text-sm text-gray-600">
                        {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : '-'}
                      </p>
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
