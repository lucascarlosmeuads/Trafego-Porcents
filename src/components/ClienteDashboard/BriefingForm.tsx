
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useClienteProgresso } from '@/hooks/useClienteProgresso'
import { TrafficManagementForm } from './TrafficManagementForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Sparkles, AlertCircle } from 'lucide-react'

interface BriefingFormProps {
  onBriefingUpdated: () => void
  onBack?: () => void
}

export function BriefingForm({ onBriefingUpdated, onBack }: BriefingFormProps) {
  const { user } = useAuth()
  const { briefing, loading } = useClienteData(user?.email || '')
  const { marcarPasso, refetch: refetchProgresso, progresso, saving } = useClienteProgresso(user?.email || '')
  const [error, setError] = useState<string | null>(null)

  console.log('🔍 [BriefingForm] === DEBUGGING BRIEFING FORM ===')
  console.log('📧 [BriefingForm] Email do cliente:', user?.email)
  console.log('📋 [BriefingForm] Briefing recebido:', briefing)
  console.log('👥 [BriefingForm] Usuário autenticado:', !!user)
  console.log('📈 [BriefingForm] Progresso atual:', progresso)
  console.log('💾 [BriefingForm] Saving progresso:', saving)

  // Função melhorada para quando briefing é atualizado
  const handleBriefingUpdated = async () => {
    try {
      console.log('📝 [BriefingForm] Briefing foi atualizado - verificando se deve marcar passo 1')
      setError(null)
      
      // Recarregar dados primeiro
      onBriefingUpdated()
      
      // Aguardar um pouco para dados carregarem e então verificar se formulário está completo
      setTimeout(async () => {
        try {
          await refetchProgresso()
          
          // Se o briefing estiver marcado como completo, marcar passo 1
          const { data: briefingAtualizado, error: fetchError } = await import('@/lib/supabase').then(async ({ supabase }) => {
            return await supabase
              .from('briefings_cliente')
              .select('formulario_completo')
              .eq('email_cliente', user?.email || '')
              .maybeSingle()
          })
          
          if (fetchError) {
            console.error('❌ [BriefingForm] Erro ao buscar briefing atualizado:', fetchError)
            setError('Erro ao verificar status do formulário')
            return
          }
          
          if (briefingAtualizado?.formulario_completo) {
            console.log('✅ [BriefingForm] Formulário completo - marcando passo 1')
            const success = await marcarPasso(1)
            if (!success) {
              console.warn('⚠️ [BriefingForm] Falha ao marcar passo 1, mas formulário foi salvo')
            }
          }
        } catch (innerError) {
          console.error('💥 [BriefingForm] Erro interno:', innerError)
          setError('Erro interno ao processar formulário')
        }
      }, 1000)
    } catch (error) {
      console.error('💥 [BriefingForm] Erro ao atualizar briefing:', error)
      setError('Erro ao processar atualização do formulário')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
          {saving && <p className="text-sm text-gray-500 mt-2">Salvando progresso...</p>}
        </div>
      </div>
    )
  }

  // Exibir erro se houver
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro no Formulário</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => {
                setError(null)
                window.location.reload()
              }}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TrafficManagementForm
      briefing={briefing}
      emailCliente={user?.email || ''}
      onBriefingUpdated={handleBriefingUpdated}
      onBack={onBack}
    />
  )
}
