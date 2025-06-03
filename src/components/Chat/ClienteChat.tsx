
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatMessages } from '@/hooks/useChatMessages'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { ChatInterface } from './ChatInterface'

interface ClienteChatProps {
  onBack?: () => void
}

export function ClienteChat({ onBack }: ClienteChatProps) {
  const { user } = useAuth()
  
  // Para cliente, sempre usar seu próprio email como emailCliente
  // O emailGestor será determinado automaticamente pelo sistema
  const {
    mensagens,
    loading,
    enviarMensagem
  } = useChatMessages(user?.email, undefined)

  // Buscar dados do gestor do cliente
  const [gestorEmail, setGestorEmail] = useState<string | null>(null)
  const [gestorNome, setGestorNome] = useState<string>('Gestor')

  useEffect(() => {
    const buscarGestorDoCliente = async () => {
      if (!user?.email) return
      
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data: clienteData } = await supabase
          .from('todos_clientes')
          .select('email_gestor')
          .eq('email_cliente', user.email)
          .maybeSingle()

        if (clienteData?.email_gestor) {
          setGestorEmail(clienteData.email_gestor)
          
          // Buscar nome do gestor
          const { data: gestorData } = await supabase
            .from('gestores')
            .select('nome')
            .eq('email', clienteData.email_gestor)
            .maybeSingle()
            
          if (gestorData?.nome) {
            setGestorNome(gestorData.nome)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar gestor:', error)
      }
    }

    buscarGestorDoCliente()
  }, [user?.email])

  const handleSendMessage = async (content: string, type: 'texto' | 'audio' = 'texto') => {
    await enviarMensagem(content, type)
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar para desktop */}
      {onBack && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat com seu Gestor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gestorEmail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {gestorNome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{gestorNome}</h3>
                    <p className="text-sm text-muted-foreground">{gestorEmail}</p>
                  </div>
                </div>
              </div>

              <ChatInterface
                emailCliente={user?.email || ''}
                emailGestor={gestorEmail}
                nomeCliente={user?.name || 'Cliente'}
                onBack={onBack}
                showBackButton={false}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum gestor encontrado</h3>
              <p className="text-muted-foreground">
                Você ainda não foi atribuído a um gestor. Entre em contato com o suporte.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de voltar para mobile */}
      {onBack && (
        <div className="md:hidden pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}
    </div>
  )
}
