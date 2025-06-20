
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useCampanhaOperations } from '@/hooks/useCampanhaOperations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ExternalLink, Save, Users, Globe } from 'lucide-react'

export function CadastroCampanhaDashboard() {
  const { user } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '')
  const { salvarLinkCampanha } = useCampanhaOperations()
  const { toast } = useToast()
  
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [linkCampanha, setLinkCampanha] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  console.log('📊 [CadastroCampanha] Clientes carregados:', clientes.length)

  const handleOpenCadastro = () => {
    window.open('https://trafego.trafegoporcents.com.br/add.php', '_blank')
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSalvar = async () => {
    if (!selectedClienteId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente",
        variant: "destructive"
      })
      return
    }

    if (!linkCampanha.trim()) {
      toast({
        title: "Erro", 
        description: "Digite o link da campanha",
        variant: "destructive"
      })
      return
    }

    if (!validateUrl(linkCampanha.trim())) {
      toast({
        title: "Erro",
        description: "Digite um link válido",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    
    try {
      const success = await salvarLinkCampanha(selectedClienteId, linkCampanha.trim())
      
      if (success) {
        toast({
          title: "Sucesso!",
          description: "Link da campanha salvo com sucesso"
        })
        setLinkCampanha('')
        setSelectedClienteId('')
      }
    } catch (error) {
      console.error('Erro ao salvar link:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar o link da campanha",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const clientesComCampanha = clientes.filter(c => c.link_campanha)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
          <p className="text-gray-300">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <ExternalLink className="h-8 w-8 text-pink-400" />
          Cadastro de Campanha
        </h1>
        <p className="text-gray-400">
          Cadastre novas campanhas e gerencie os links para seus clientes
        </p>
      </div>

      {/* Card de Cadastro */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-pink-400" />
            Nova Campanha
          </CardTitle>
          <CardDescription className="text-gray-400">
            Primeiro cadastre a campanha no sistema externo, depois cole o link aqui
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botão para abrir link externo */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button 
              onClick={handleOpenCadastro}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Cadastrar Nova Campanha
            </Button>
            <p className="text-sm text-gray-400">
              Clique para abrir o sistema de cadastro de campanhas
            </p>
          </div>

          {/* Formulário para salvar link */}
          <div className="border-t border-gray-800 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Salvar Link da Campanha</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção de Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente" className="text-gray-300">Cliente</Label>
                <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {clientes.map((cliente) => (
                      <SelectItem 
                        key={cliente.id} 
                        value={cliente.id.toString()}
                        className="text-white hover:bg-gray-700"
                      >
                        {cliente.nome_cliente} - {cliente.email_cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input do Link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="text-gray-300">Link da Campanha</Label>
                <div className="flex gap-2">
                  <Input
                    id="link"
                    type="url"
                    placeholder="Cole o link da campanha aqui..."
                    value={linkCampanha}
                    onChange={(e) => setLinkCampanha(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Button 
                    onClick={handleSalvar}
                    disabled={isSaving || !selectedClienteId || !linkCampanha.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Campanhas Cadastradas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            Campanhas Cadastradas ({clientesComCampanha.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientesComCampanha.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Nenhuma campanha cadastrada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {clientesComCampanha.map((cliente) => (
                <div 
                  key={cliente.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{cliente.nome_cliente}</h4>
                    <p className="text-sm text-gray-400">{cliente.email_cliente}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(cliente.link_campanha, '_blank')}
                    className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Campanha
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
