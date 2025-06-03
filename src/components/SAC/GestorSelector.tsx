
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Save, X, Loader2, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useGestores } from '@/hooks/useGestores'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface GestorSelectorProps {
  solicitacao: SacSolicitacao
  onUpdateGestor: (solicitacaoId: string, emailGestor: string, nomeGestor: string) => Promise<any>
  onGestorUpdated?: (updatedSolicitacao: SacSolicitacao) => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'pending_sync'

export function GestorSelector({ solicitacao, onUpdateGestor, onGestorUpdated }: GestorSelectorProps) {
  const { toast } = useToast()
  const { gestores, loading: loadingGestores } = useGestores()
  const [isEditing, setIsEditing] = useState(!solicitacao.nome_gestor)
  const [selectedGestorEmail, setSelectedGestorEmail] = useState(solicitacao.email_gestor || '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  
  // Estado local que sempre reflete o último estado conhecido
  const [currentGestorEmail, setCurrentGestorEmail] = useState(solicitacao.email_gestor || '')
  const [currentGestorNome, setCurrentGestorNome] = useState(solicitacao.nome_gestor || '')

  // Sincronizar com mudanças na prop solicitacao
  useEffect(() => {
    console.log('🔄 [GestorSelector] Props solicitacao mudou:', {
      id: solicitacao.id,
      email_gestor: solicitacao.email_gestor,
      nome_gestor: solicitacao.nome_gestor
    })
    
    // Só atualizar se não estivermos editando e não há mudanças pendentes
    if (!isEditing && saveStatus !== 'pending_sync') {
      setCurrentGestorEmail(solicitacao.email_gestor || '')
      setCurrentGestorNome(solicitacao.nome_gestor || '')
      setSelectedGestorEmail(solicitacao.email_gestor || '')
    }
  }, [solicitacao.email_gestor, solicitacao.nome_gestor, isEditing, saveStatus])

  // Encontrar o gestor selecionado pelo email
  const selectedGestor = gestores.find(g => g.email === selectedGestorEmail)
  const currentGestor = gestores.find(g => g.email === currentGestorEmail)

  console.log('🔍 [GestorSelector] === DEBUG ESTADO ATUAL ===')
  console.log('🔍 [GestorSelector] Solicitação ID:', solicitacao.id)
  console.log('🔍 [GestorSelector] Props gestor:', { email: solicitacao.email_gestor, nome: solicitacao.nome_gestor })
  console.log('🔍 [GestorSelector] Estado local atual:', { email: currentGestorEmail, nome: currentGestorNome })
  console.log('🔍 [GestorSelector] Email selecionado:', selectedGestorEmail)
  console.log('🔍 [GestorSelector] Status de salvamento:', saveStatus)
  console.log('🔍 [GestorSelector] Editando:', isEditing)

  const handleSave = async () => {
    if (!selectedGestorEmail || !selectedGestor) {
      console.warn('⚠️ [GestorSelector] Tentativa de salvar sem gestor selecionado')
      toast({
        title: "Erro",
        description: "Por favor, selecione um gestor.",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('💾 [GestorSelector] === INICIANDO SALVAMENTO ===')
      
      setSaveStatus('saving')
      
      // 1. ATUALIZAR ESTADO LOCAL IMEDIATAMENTE
      console.log('✅ [GestorSelector] Atualizando estado local primeiro...')
      setCurrentGestorEmail(selectedGestor.email)
      setCurrentGestorNome(selectedGestor.nome)
      
      // Notificar o componente pai sobre a atualização LOCAL
      if (onGestorUpdated) {
        const updatedSolicitacao = {
          ...solicitacao,
          email_gestor: selectedGestor.email,
          nome_gestor: selectedGestor.nome
        }
        console.log('🔄 [GestorSelector] Notificando componente pai (estado local):', updatedSolicitacao)
        onGestorUpdated(updatedSolicitacao)
      }
      
      setIsEditing(false)
      
      // Toast de feedback imediato
      toast({
        title: "Gestor Atribuído!",
        description: `${selectedGestor.nome} foi definido como responsável.`,
        duration: 3000
      })
      
      // 2. TENTAR SALVAR NO BANCO
      console.log('💾 [GestorSelector] Salvando no banco de dados...')
      setSaveStatus('pending_sync')
      
      try {
        const result = await onUpdateGestor(solicitacao.id, selectedGestor.email, selectedGestor.nome)
        console.log('✅ [GestorSelector] Salvamento no banco concluído:', result)
        
        setSaveStatus('saved')
        
        // Toast de confirmação
        toast({
          title: "✅ Sincronizado",
          description: "Dados salvos no servidor com sucesso.",
          duration: 2000
        })
        
        // Auto-clear do status após 3 segundos
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
        
      } catch (dbError) {
        console.error('❌ [GestorSelector] Erro ao salvar no banco:', dbError)
        setSaveStatus('error')
        
        // Toast de erro com opção de retry
        toast({
          title: "⚠️ Erro de Sincronização",
          description: "Gestor atribuído localmente, mas falhou ao salvar no servidor. Tentando novamente...",
          variant: "destructive",
          duration: 5000
        })
        
        // Retry automático após 3 segundos
        setTimeout(async () => {
          try {
            console.log('🔄 [GestorSelector] Tentativa de retry automático...')
            setSaveStatus('pending_sync')
            
            await onUpdateGestor(solicitacao.id, selectedGestor.email, selectedGestor.nome)
            console.log('✅ [GestorSelector] Retry bem-sucedido!')
            
            setSaveStatus('saved')
            
            toast({
              title: "✅ Sincronizado",
              description: "Dados foram salvos no servidor após retry.",
              duration: 2000
            })
            
            setTimeout(() => {
              setSaveStatus('idle')
            }, 2000)
            
          } catch (retryError) {
            console.error('❌ [GestorSelector] Retry falhou:', retryError)
            setSaveStatus('error')
            
            toast({
              title: "❌ Falha na Sincronização",
              description: "Não foi possível salvar no servidor. Gestor atribuído apenas localmente.",
              variant: "destructive",
              duration: 8000
            })
          }
        }, 3000)
      }
      
    } catch (error) {
      console.error('❌ [GestorSelector] Erro crítico:', error)
      setSaveStatus('error')
      
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o gestor. Tente novamente.",
        variant: "destructive",
        duration: 6000
      })
      
      // Reverter estado local em caso de erro crítico
      setCurrentGestorEmail(solicitacao.email_gestor || '')
      setCurrentGestorNome(solicitacao.nome_gestor || '')
      setSelectedGestorEmail(solicitacao.email_gestor || '')
    }
  }

  const handleCancel = () => {
    console.log('↩️ [GestorSelector] Cancelando edição')
    setSelectedGestorEmail(currentGestorEmail)
    setIsEditing(false)
    setSaveStatus('idle')
  }

  const handleStartEdit = () => {
    console.log('✏️ [GestorSelector] Iniciando edição')
    setSelectedGestorEmail(currentGestorEmail)
    setIsEditing(true)
    setSaveStatus('idle')
  }

  const handleGestorChange = (email: string) => {
    console.log('🎯 [GestorSelector] === MUDANÇA DE SELEÇÃO ===')
    console.log('🎯 [GestorSelector] Email selecionado:', email)
    
    const gestorSelecionado = gestores.find(g => g.email === email)
    console.log('🎯 [GestorSelector] Gestor correspondente:', gestorSelecionado)
    
    setSelectedGestorEmail(email)
  }

  const handleRetrySync = async () => {
    if (!currentGestorEmail || !currentGestorNome) return
    
    try {
      setSaveStatus('pending_sync')
      await onUpdateGestor(solicitacao.id, currentGestorEmail, currentGestorNome)
      setSaveStatus('saved')
      
      toast({
        title: "✅ Sincronizado",
        description: "Dados foram salvos no servidor.",
        duration: 2000
      })
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      
    } catch (error) {
      setSaveStatus('error')
      toast({
        title: "❌ Falha na Sincronização",
        description: "Não foi possível salvar no servidor.",
        variant: "destructive",
        duration: 5000
      })
    }
  }

  // Função para obter ícone e cor baseado no status
  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'pending_sync':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Salvando...'
      case 'pending_sync':
        return 'Sincronizando...'
      case 'saved':
        return 'Sincronizado'
      case 'error':
        return 'Erro de sincronização'
      default:
        return ''
    }
  }

  if (loadingGestores) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader className="bg-white">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <User className="h-5 w-5" />
            Gestor Responsável
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-sm text-gray-500">Carregando gestores...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="bg-white">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <User className="h-5 w-5" />
          Gestor Responsável
          {getStatusIcon()}
          {saveStatus !== 'idle' && (
            <span className="text-xs text-gray-600">{getStatusText()}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 bg-white">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Selecionar Gestor
              </label>
              <Select 
                value={selectedGestorEmail} 
                onValueChange={handleGestorChange}
                disabled={saveStatus === 'saving'}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Escolha um gestor...">
                    {selectedGestor ? selectedGestor.nome : "Escolha um gestor..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {gestores.map((gestor) => (
                    <SelectItem key={gestor.id} value={gestor.email} className="text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{gestor.nome}</span>
                        <span className="text-xs text-gray-500">{gestor.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={saveStatus === 'saving' || !selectedGestorEmail}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                size="sm"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
              
              {currentGestorNome && (
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={saveStatus === 'saving'}
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>

            {gestores.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
                <AlertTriangle className="h-4 w-4" />
                Nenhum gestor ativo encontrado no sistema
              </div>
            )}
          </div>
        ) : (
          <div>
            {currentGestorNome ? (
              <>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome do Gestor</label>
                    <p className="text-lg font-semibold text-gray-900">{currentGestorNome}</p>
                  </div>
                  
                  {currentGestorEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email do Gestor</label>
                      <p className="text-sm text-gray-800">{currentGestorEmail}</p>
                    </div>
                  )}

                  {/* Status de sincronização */}
                  {saveStatus !== 'idle' && (
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon()}
                      <span className={`
                        ${saveStatus === 'error' ? 'text-red-600' : ''}
                        ${saveStatus === 'pending_sync' ? 'text-yellow-600' : ''}
                        ${saveStatus === 'saved' ? 'text-green-600' : ''}
                        ${saveStatus === 'saving' ? 'text-blue-600' : ''}
                      `}>
                        {getStatusText()}
                      </span>
                      {saveStatus === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRetrySync}
                          className="ml-2 h-6 px-2 text-xs"
                        >
                          Tentar novamente
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartEdit}
                  variant="outline"
                  size="sm"
                  className="mt-3 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Alterar Gestor
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <User className="h-12 w-12 mx-auto opacity-50" />
                </div>
                <p className="text-gray-500 mb-4">Nenhum gestor atribuído</p>
                <Button
                  onClick={handleStartEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Atribuir Gestor
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
