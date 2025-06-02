
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSitesData } from '@/hooks/useSitesData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Globe, CheckCircle, Clock, LogOut, ExternalLink, Edit3, Trash2, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

type FiltroStatus = 'todos' | 'pendentes' | 'finalizados'

export function SitesDashboard() {
  const { user, signOut } = useAuth()
  const { clientes, loading, refetch } = useSitesData()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [updatingClientes, setUpdatingClientes] = useState<Set<number>>(new Set())
  const [linkInputs, setLinkInputs] = useState<Record<number, string>>({})
  const [editingLinks, setEditingLinks] = useState<Set<number>>(new Set())
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroStatus>('todos')
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

  const handleEditLink = (clienteId: number, currentLink: string) => {
    setLinkInputs(prev => ({
      ...prev,
      [clienteId]: currentLink
    }))
    setEditingLinks(prev => new Set([...prev, clienteId]))
  }

  const handleCancelEdit = (clienteId: number) => {
    setEditingLinks(prev => {
      const newSet = new Set(prev)
      newSet.delete(clienteId)
      return newSet
    })
    setLinkInputs(prev => {
      const newInputs = { ...prev }
      delete newInputs[clienteId]
      return newInputs
    })
  }

  const handleSaveLink = async (clienteId: number) => {
    const newLink = linkInputs[clienteId]?.trim()
    
    if (!newLink) {
      toast({
        title: "Link obrigatório",
        description: "Por favor, insira um link válido",
        variant: "destructive"
      })
      return
    }

    setUpdatingClientes(prev => new Set([...prev, clienteId]))
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ link_site: newLink })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Link atualizado com sucesso"
      })

      setEditingLinks(prev => {
        const newSet = new Set(prev)
        newSet.delete(clienteId)
        return newSet
      })
      
      setLinkInputs(prev => {
        const newInputs = { ...prev }
        delete newInputs[clienteId]
        return newInputs
      })

      await refetch()
    } catch (error) {
      console.error('Erro ao atualizar link:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar link",
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

  const handleDeleteLink = async (clienteId: number) => {
    setUpdatingClientes(prev => new Set([...prev, clienteId]))
    
    try {
      const { error } = await supabase
        .from('todos_clientes')
        .update({ link_site: null })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Link removido com sucesso"
      })

      await refetch()
    } catch (error) {
      console.error('Erro ao remover link:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover link",
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

  const openLink = (url: string) => {
    if (!url) return
    
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`
    }
    
    try {
      window.open(finalUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir o link",
        variant: "destructive"
      })
    }
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

      if (sitePago) {
        updateData.site_status = 'finalizado'
        if (linkInputs[clienteId]?.trim()) {
          updateData.link_site = linkInputs[clienteId].trim()
        }
      } else {
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

      if (sitePago) {
        setLinkInputs(prev => {
          const newInputs = { ...prev }
          delete newInputs[clienteId]
          return newInputs
        })
      }

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

  const filtrarClientes = () => {
    switch (filtroAtivo) {
      case 'pendentes':
        return clientes.filter(cliente => cliente.site_status === 'aguardando_link')
      case 'finalizados':
        return clientes.filter(cliente => cliente.site_status === 'finalizado')
      default:
        return clientes
    }
  }

  const getTituloSecao = () => {
    const clientesFiltrados = filtrarClientes()
    switch (filtroAtivo) {
      case 'pendentes':
        return `Sites Pendentes (${clientesFiltrados.length})`
      case 'finalizados':
        return `Sites Finalizados (${clientesFiltrados.length})`
      default:
        return `Todos os Sites (${clientesFiltrados.length})`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Carregando...</div>
      </div>
    )
  }

  const sitesPendentes = clientes.filter(cliente => cliente.site_status === 'aguardando_link').length
  const sitesFinalizados = clientes.filter(cliente => cliente.site_status === 'finalizado').length
  const sitesPagos = clientes.filter(cliente => cliente.site_status === 'finalizado' && cliente.site_pago).length
  const valorTotalFinalizados = sitesFinalizados * 20
  const valorTotalRecebido = sitesPagos * 20
  const clientesFiltrados = filtrarClientes()

  console.log('🌐 [SitesDashboard] Métricas calculadas:', {
    sitesPendentes,
    sitesFinalizados,
    sitesPagos,
    valorTotalFinalizados,
    valorTotalRecebido,
    total: clientes.length
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Sites</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:hover:bg-red-950 dark:border-red-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? 'Saindo...' : 'Sair'}
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              filtroAtivo === 'todos' ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'
            }`}
            onClick={() => setFiltroAtivo('todos')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total de Sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{clientes.length}</div>
              {filtroAtivo === 'todos' && (
                <p className="text-xs text-blue-600 mt-1">Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              filtroAtivo === 'pendentes' ? 'ring-2 ring-yellow-500 border-yellow-500' : 'hover:border-gray-400'
            }`}
            onClick={() => setFiltroAtivo('pendentes')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Sites Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{sitesPendentes}</div>
              {filtroAtivo === 'pendentes' && (
                <p className="text-xs text-yellow-600 mt-1">Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              filtroAtivo === 'finalizados' ? 'ring-2 ring-green-500 border-green-500' : 'hover:border-gray-400'
            }`}
            onClick={() => setFiltroAtivo('finalizados')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Sites Finalizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{sitesFinalizados}</div>
              {filtroAtivo === 'finalizados' && (
                <p className="text-xs text-green-600 mt-1">Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          {/* Relatório Financeiro */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Relatório Financeiro</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  R$ {valorTotalRecebido.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Recebido ({sitesPagos} sites pagos)
                </div>
                <div className="text-xs text-muted-foreground">
                  Total possível: R$ {valorTotalFinalizados.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Sites */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">{getTituloSecao()}</CardTitle>
          </CardHeader>
          <CardContent>
            {clientesFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {filtroAtivo === 'pendentes' && 'Nenhum site pendente encontrado.'}
                  {filtroAtivo === 'finalizados' && 'Nenhum site finalizado encontrado.'}
                  {filtroAtivo === 'todos' && 'Nenhum site encontrado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientesFiltrados.map((cliente) => {
                  const isUpdating = updatingClientes.has(Number(cliente.id))
                  const isPendente = cliente.site_status === 'aguardando_link'
                  const isEditing = editingLinks.has(cliente.id)
                  const linkValue = linkInputs[cliente.id] || cliente.link_site || ''
                  
                  return (
                    <div key={cliente.id} className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{cliente.nome_cliente}</h3>
                          <Badge variant={cliente.site_status === 'finalizado' ? "default" : "secondary"}>
                            {cliente.site_status === 'finalizado' ? "Finalizado" : "Pendente"}
                          </Badge>
                          {cliente.site_pago && (
                            <Badge variant="default" className="bg-green-600">
                              Pago
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cliente.email_cliente}</p>
                        <p className="text-sm text-muted-foreground">
                          Gestor: {cliente.email_gestor || 'Não definido'}
                        </p>
                        
                        {/* Input de link para sites pendentes */}
                        {isPendente && (
                          <div className="mt-2">
                            <Input
                              placeholder="Cole o link do site aqui..."
                              value={linkValue}
                              onChange={(e) => handleLinkChange(cliente.id, e.target.value)}
                              className="text-sm bg-background border-input text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        )}
                        
                        {/* Exibir/Editar link para sites finalizados */}
                        {!isPendente && (
                          <div className="mt-2">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <Input
                                  value={linkValue}
                                  onChange={(e) => handleLinkChange(cliente.id, e.target.value)}
                                  className="text-sm bg-background border-input text-foreground"
                                  placeholder="Digite o link do site"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveLink(cliente.id)}
                                  disabled={isUpdating}
                                >
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelEdit(cliente.id)}
                                  disabled={isUpdating}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {cliente.link_site ? (
                                  <>
                                    <button
                                      onClick={() => openLink(cliente.link_site)}
                                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline flex items-center gap-1"
                                    >
                                      {cliente.link_site}
                                      <ExternalLink className="h-3 w-3" />
                                    </button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditLink(cliente.id, cliente.link_site)}
                                      className="h-6 w-6 p-0"
                                      title="Editar link"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteLink(cliente.id)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      title="Remover link"
                                      disabled={isUpdating}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Nenhum link cadastrado</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditLink(cliente.id, '')}
                                      className="h-6 w-6 p-0"
                                      title="Adicionar link"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
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
