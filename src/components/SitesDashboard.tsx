
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSitesData } from '@/hooks/useSitesData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Globe, CheckCircle, Clock, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function SitesDashboard() {
  const { user, signOut } = useAuth()
  const { clientes, loading, refetch } = useSitesData()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [updatingClientes, setUpdatingClientes] = useState<Set<number>>(new Set())
  const [linkInputs, setLinkInputs] = useState<Record<number, string>>({})
  const { toast } = useToast()

  console.log('🌐 [SitesDashboard] === DEBUGGING PAINEL DE SITES ===')
  console.log('🌐 [SitesDashboard] Dados recebidos:', {
    loading,
    totalClientes: clientes.length,
    aguardandoLink: clientes.filter(c => c.site_status === 'aguardando_link').length,
    finalizados: clientes.filter(c => c.site_status === 'finalizado').length
  })

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

  const handleLinkChange = (clienteId: number, link: string) => {
    setLinkInputs(prev => ({
      ...prev,
      [clienteId]: link
    }))
  }

  const handleToggleSitePago = async (clienteId: number, sitePago: boolean) => {
    console.log('🌐 [SitesDashboard] === ATUALIZANDO STATUS DO SITE ===')
    console.log('🌐 [SitesDashboard] Cliente ID:', clienteId)
    console.log('🌐 [SitesDashboard] Novo status pago:', sitePago)
    
    if (sitePago && !linkInputs[clienteId]?.trim()) {
      toast({
        title: "Link obrigatório",
        description: "Por favor, insira o link do site antes de marcar como finalizado",
        variant: "destructive"
      })
      return
    }

    setUpdatingClientes(prev => new Set([...prev, clienteId]))
    
    try {
      const updateData: any = {
        site_pago: sitePago
      }

      // Se está marcando como finalizado, atualizar também o site_status e o link
      if (sitePago) {
        updateData.site_status = 'finalizado'
        if (linkInputs[clienteId]?.trim()) {
          updateData.link_site = linkInputs[clienteId].trim()
        }
      } else {
        // Se está desmarcando, volta para aguardando_link
        updateData.site_status = 'aguardando_link'
      }

      console.log('🌐 [SitesDashboard] Dados a serem atualizados:', updateData)

      const { error } = await supabase
        .from('todos_clientes')
        .update(updateData)
        .eq('id', clienteId)

      if (error) {
        throw error
      }

      console.log('✅ [SitesDashboard] Status atualizado com sucesso!')

      toast({
        title: "Sucesso",
        description: `Site ${sitePago ? 'finalizado' : 'marcado como pendente'} com sucesso`
      })

      // Limpar o input se foi finalizado
      if (sitePago) {
        setLinkInputs(prev => {
          const newInputs = { ...prev }
          delete newInputs[clienteId]
          return newInputs
        })
      }

      // Recarregar dados
      await refetch()
    } catch (error) {
      console.error('❌ [SitesDashboard] Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do site",
        variant: "destructive"
      })
    } finally {
      setUpdatingClientes(prev => {
        const newSet = new Set(prev)
        newSet.delete(clienteId)
        return newSet
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

  // Calcular métricas corretas baseadas no site_status
  const sitesPendentes = clientes.filter(cliente => cliente.site_status === 'aguardando_link').length
  const sitesFinalizados = clientes.filter(cliente => cliente.site_status === 'finalizado').length

  console.log('🌐 [SitesDashboard] Métricas calculadas:', {
    sitesPendentes,
    sitesFinalizados,
    total: clientes.length
  })

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
                {clientes.map((cliente) => {
                  const isUpdating = updatingClientes.has(Number(cliente.id))
                  const isPendente = cliente.site_status === 'aguardando_link'
                  const linkValue = linkInputs[cliente.id] || cliente.link_site || ''
                  
                  return (
                    <div key={cliente.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{cliente.nome_cliente}</h3>
                          <Badge variant={cliente.site_status === 'finalizado' ? "default" : "secondary"}>
                            {cliente.site_status === 'finalizado' ? "Finalizado" : "Pendente"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{cliente.email_cliente}</p>
                        <p className="text-sm text-gray-500">
                          Gestor: {cliente.email_gestor || 'Não definido'}
                        </p>
                        
                        {/* Input de link para sites pendentes */}
                        {isPendente && (
                          <div className="mt-2">
                            <Input
                              placeholder="Cole o link do site aqui..."
                              value={linkValue}
                              onChange={(e) => handleLinkChange(cliente.id, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        )}
                        
                        {/* Exibir link para sites finalizados */}
                        {!isPendente && cliente.link_site && (
                          <div className="mt-2">
                            <a 
                              href={cliente.link_site} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              {cliente.link_site}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant={cliente.site_status === 'finalizado' ? "outline" : "default"}
                        onClick={() => handleToggleSitePago(Number(cliente.id), cliente.site_status !== 'finalizado')}
                        disabled={isUpdating}
                        className="ml-4"
                      >
                        {isUpdating ? "Atualizando..." : 
                         cliente.site_status === 'finalizado' ? "Marcar como Pendente" : "Marcar como Finalizado"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
