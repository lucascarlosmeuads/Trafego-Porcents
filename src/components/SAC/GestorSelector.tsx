
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Save, X, Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useGestores } from '@/hooks/useGestores'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface GestorSelectorProps {
  solicitacao: SacSolicitacao
  onUpdateGestor: (solicitacaoId: string, emailGestor: string, nomeGestor: string) => Promise<any>
  onGestorUpdated?: (updatedSolicitacao: SacSolicitacao) => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

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
    
    setCurrentGestorEmail(solicitacao.email_gestor || '')
    setCurrentGestorNome(solicitacao.nome_gestor || '')
    
    // Se não estiver editando, atualizar também a seleção
    if (!isEditing) {
      setSelectedGestorEmail(solicitacao.email_gestor || '')
    }
  }, [solicitacao.email_gestor, solicitacao.nome_gestor, isEditing])

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
      console.log('💾 [GestorSelector] Dados a serem salvos:', {
        solicitacaoId: solicitacao.id,
        email: selectedGestor.email,
        nome: selectedGestor.nome
      })
      
      setSaveStatus('saving')
      
      // Salvar no banco de dados
      const result = await onUpdateGestor(solicitacao.id, selectedGestor.email, selectedGestor.nome)
      console.log('✅ [GestorSelector] Salvamento concluído:', result)
      
      // Atualizar estado local
      setCurrentGestorEmail(selectedGestor.email)
      setCurrentGestorNome(selectedGestor.nome)
      
      // Notificar o componente pai
      if (onGestorUpdated) {
        const updatedSolicitacao = {
          ...solicitacao,
          email_gestor: selectedGestor.email,
          nome_gestor: selectedGestor.nome
        }
        console.log('🔄 [GestorSelector] Notificando componente pai:', updatedSolicitacao)
        onGestorUpdated(updatedSolicitacao)
      }
      
      setIsEditing(false)
      setSaveStatus('saved')
      
      toast({
        title: "✅ Gestor Atribuído!",
        description: `${selectedGestor.nome} foi definido como responsável e salvo no banco de dados.`,
        duration: 3000
      })
      
      // Auto-clear do status após 3 segundos
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
      
    } catch (error) {
      console.error('❌ [GestorSelector] Erro ao salvar:', error)
      setSaveStatus('error')
      
      toast({
        title: "❌ Erro ao Salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o gestor. Tente novamente.",
        variant: "destructive",
        duration: 6000
      })
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

  // Função para obter ícone e cor baseado no status
  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
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
      case 'saved':
        return 'Salvo!'
      case 'error':
        return 'Erro ao salvar'
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

                  {/* Status de salvamento */}
                  {saveStatus !== 'idle' && (
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon()}
                      <span className={`
                        ${saveStatus === 'error' ? 'text-red-600' : ''}
                        ${saveStatus === 'saved' ? 'text-green-600' : ''}
                        ${saveStatus === 'saving' ? 'text-blue-600' : ''}
                      `}>
                        {getStatusText()}
                      </span>
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
