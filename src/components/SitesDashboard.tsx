
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSitesData } from '@/hooks/useSitesData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, CheckCircle, Clock, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function SitesDashboard() {
  const { user, signOut } = useAuth()
  const { clientes, loading } = useSitesData()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { toast } = useToast()

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

  const handleToggleSitePago = async (clienteId: number, sitePago: boolean) => {
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ site_pago: sitePago })
        .eq('id', clienteId)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: `Site marcado como ${sitePago ? 'finalizado' : 'pendente'}`
      })

      // Reload data
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar status do site:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do site",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  const sitesPendentes = clientes.filter(cliente => !cliente.site_pago).length
  const sitesFinalizados = clientes.filter(cliente => cliente.site_pago).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Sites</h1>
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
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{sitesPendentes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites Finalizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{sitesFinalizados}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Sites */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Sites</CardTitle>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum site encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{cliente.nome_cliente}</h3>
                        <Badge variant={cliente.site_pago ? "default" : "secondary"}>
                          {cliente.site_pago ? "Finalizado" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{cliente.email_cliente}</p>
                      <p className="text-sm text-gray-500">
                        Gestor: {cliente.email_gestor || 'Não definido'}
                      </p>
                    </div>
                    <Button
                      variant={cliente.site_pago ? "outline" : "default"}
                      onClick={() => handleToggleSitePago(Number(cliente.id), !cliente.site_pago)}
                      className="ml-4"
                    >
                      {cliente.site_pago ? "Marcar como Pendente" : "Marcar como Finalizado"}
                    </Button>
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
