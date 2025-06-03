
import { useState } from 'react'
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

export function GestorSelector({ solicitacao, onUpdateGestor, onGestorUpdated }: GestorSelectorProps) {
  const { toast } = useToast()
  const { gestores, loading: loadingGestores } = useGestores()
  const [isEditing, setIsEditing] = useState(!solicitacao.nome_gestor)
  const [selectedGestorEmail, setSelectedGestorEmail] = useState(solicitacao.email_gestor || '')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  
  // Estado local para mostrar gestor selecionado imediatamente
  const [localGestorEmail, setLocalGestorEmail] = useState(solicitacao.email_gestor || '')
  const [localGestorNome, setLocalGestorNome] = useState(solicitacao.nome_gestor || '')

  // Encontrar o gestor selecionado pelo email
  const selectedGestor = gestores.find(g => g.email === selectedGestorEmail)

  console.log('🔍 [GestorSelector] === DEBUG SELEÇÃO DE GESTOR ===')
  console.log('🔍 [GestorSelector] Email selecionado:', selectedGestorEmail)
  console.log('🔍 [GestorSelector] Gestor encontrado:', selectedGestor)
  console.log('🔍 [GestorSelector] Estado local:', { localGestorEmail, localGestorNome })

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
      console.log('💾 [GestorSelector] === INÍCIO SALVAMENTO (ESTADO LOCAL PRIMEIRO) ===')
      
      setSaving(true)
      
      // 1. ATUALIZAR ESTADO LOCAL IMEDIATAMENTE
      console.log('✅ [GestorSelector] Atualizando estado local primeiro...')
      setLocalGestorEmail(selectedGestor.email)
      setLocalGestorNome(selectedGestor.nome)
      
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
      
      // Mostrar sucesso imediato
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 3000)
      
      toast({
        title: "Gestor Atribuído!",
        description: `${selectedGestor.nome} foi definido como responsável.`,
        duration: 3000
      })
      
      setIsEditing(false)
      
      // 2. TENTAR SALVAR NO BANCO EM BACKGROUND
      console.log('💾 [GestorSelector] Salvando no banco de dados em background...')
      
      try {
        const result = await onUpdateGestor(solicitacao.id, selectedGestor.email, selectedGestor.nome)
        console.log('✅ [GestorSelector] Salvamento no banco concluído:', result)
        
        // Toast discreto confirmando salvamento no banco
        toast({
          title: "Sincronizado",
          description: "Dados salvos no servidor.",
          duration: 2000
        })
        
      } catch (dbError) {
        console.error('⚠️ [GestorSelector] Erro ao salvar no banco (mantendo estado local):', dbError)
        
        // Toast informativo mas não crítico
        toast({
          title: "Aviso",
          description: "Gestor atribuído localmente. Tentando sincronizar...",
          duration: 4000
        })
        
        // Implementar retry automático após 5 segundos
        setTimeout(async () => {
          try {
            console.log('🔄 [GestorSelector] Tentativa de retry automático...')
            await onUpdateGestor(solicitacao.id, selectedGestor.email, selectedGestor.nome)
            console.log('✅ [GestorSelector] Retry bem-sucedido!')
            
            toast({
              title: "Sincronizado",
              description: "Dados foram salvos no servidor.",
              duration: 2000
            })
          } catch (retryError) {
            console.error('❌ [GestorSelector] Retry falhou:', retryError)
          }
        }, 5000)
      }
      
    } catch (error) {
      console.error('❌ [GestorSelector] Erro crítico:', error)
      
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o gestor. Tente novamente.",
        variant: "destructive",
        duration: 6000
      })
      
      // Reverter estado local em caso de erro crítico
      setLocalGestorEmail(solicitacao.email_gestor || '')
      setLocalGestorNome(solicitacao.nome_gestor || '')
      setSelectedGestorEmail(solicitacao.email_gestor || '')
      
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    console.log('↩️ [GestorSelector] Cancelando edição')
    setSelectedGestorEmail(localGestorEmail)
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    console.log('✏️ [GestorSelector] Iniciando edição')
    setSelectedGestorEmail(localGestorEmail)
    setIsEditing(true)
  }

  const handleGestorChange = (email: string) => {
    console.log('🎯 [GestorSelector] === MUDANÇA DE SELEÇÃO ===')
    console.log('🎯 [GestorSelector] Email selecionado:', email)
    
    const gestorSelecionado = gestores.find(g => g.email === email)
    console.log('🎯 [GestorSelector] Gestor correspondente:', gestorSelecionado)
    
    setSelectedGestorEmail(email)
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
          {saving && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          {justSaved && <CheckCircle className="h-4 w-4 text-green-500" />}
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
                disabled={saving}
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
                disabled={saving || !selectedGestorEmail}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                size="sm"
              >
                {saving ? (
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
              
              {localGestorNome && (
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={saving}
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
            {localGestorNome ? (
              <>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome do Gestor</label>
                    <p className="text-lg font-semibold text-gray-900">{localGestorNome}</p>
                  </div>
                  
                  {localGestorEmail && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email do Gestor</label>
                      <p className="text-sm text-gray-800">{localGestorEmail}</p>
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
