
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Save, X, Loader2, RefreshCw, CheckCircle } from 'lucide-react'
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

  const selectedGestor = gestores.find(g => g.email === selectedGestorEmail)

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
      console.log('💾 [GestorSelector] Iniciando salvamento:', {
        solicitacaoId: solicitacao.id,
        gestorEmail: selectedGestor.email,
        gestorNome: selectedGestor.nome
      })

      setSaving(true)
      
      const result = await onUpdateGestor(solicitacao.id, selectedGestor.email, selectedGestor.nome)
      
      console.log('✅ [GestorSelector] Salvamento concluído:', result)
      
      // Mostrar indicador de sucesso
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
      
      // Notificar o componente pai sobre a atualização
      if (onGestorUpdated) {
        onGestorUpdated({
          ...solicitacao,
          email_gestor: selectedGestor.email,
          nome_gestor: selectedGestor.nome
        })
      }
      
      toast({
        title: "Sucesso!",
        description: `Gestor responsável atualizado para ${selectedGestor.nome}.`,
        duration: 3000
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('❌ [GestorSelector] Erro ao salvar:', error)
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o gestor responsável.",
        variant: "destructive"
      })
      
      // Reverter seleção em caso de erro
      setSelectedGestorEmail(solicitacao.email_gestor || '')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    console.log('↩️ [GestorSelector] Cancelando edição')
    setSelectedGestorEmail(solicitacao.email_gestor || '')
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    console.log('✏️ [GestorSelector] Iniciando edição')
    setIsEditing(true)
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
                onValueChange={(value) => {
                  console.log('🎯 [GestorSelector] Gestor selecionado:', value)
                  setSelectedGestorEmail(value)
                }}
                disabled={saving}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Escolha um gestor..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {gestores.map((gestor) => (
                    <SelectItem key={gestor.id} value={gestor.email} className="text-gray-900">
                      {gestor.nome}
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
              
              {solicitacao.nome_gestor && (
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
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Nenhum gestor ativo encontrado no sistema
              </div>
            )}
          </div>
        ) : (
          <div>
            {solicitacao.nome_gestor ? (
              <>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome do Gestor</label>
                    <p className="text-lg font-semibold text-gray-900">{solicitacao.nome_gestor}</p>
                  </div>
                  
                  {solicitacao.email_gestor && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email do Gestor</label>
                      <p className="text-sm text-gray-800">{solicitacao.email_gestor}</p>
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
