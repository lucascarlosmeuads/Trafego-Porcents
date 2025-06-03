import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChatMessages } from '@/hooks/useChatMessages'
import { useChatProfiles } from '@/hooks/useChatProfiles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { ChatInterface } from './ChatInterface'

interface ClienteChatProps {
  onBack?: () => void
}

export function ClienteChat({ onBack }: ClienteChatProps) {
  const { user } = useAuth()
  const { gestorProfiles } = useChatProfiles()
  const [selectedGestor, setSelectedGestor] = useState<string | null>(null)

  useEffect(() => {
    if (gestorProfiles.length > 0 && !selectedGestor) {
      // Auto-select the first gestor if none is selected
      setSelectedGestor(gestorProfiles[0].email)
    }
  }, [gestorProfiles, selectedGestor])

  // Auto-select first gestor when profiles load
  useEffect(() => {
    if (gestorProfiles.length > 0 && !selectedGestor) {
      setSelectedGestor(gestorProfiles[0].email)
    }
  }, [gestorProfiles, selectedGestor])

  const selectedGestorProfile = gestorProfiles.find(g => g.email === selectedGestor)

  const {
    messages,
    loading,
    sendMessage,
    markAsRead
  } = useChatMessages(user?.email || '', selectedGestor || '', 'cliente')

  useEffect(() => {
    if (selectedGestor && messages.length > 0) {
      markAsRead()
    }
  }, [selectedGestor, messages.length, markAsRead])

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
          {selectedGestor ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {selectedGestorProfile?.nome_gestor?.charAt(0).toUpperCase() || 'G'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedGestorProfile?.nome_gestor || 'Gestor'}</h3>
                    <p className="text-sm text-muted-foreground">{selectedGestor}</p>
                  </div>
                </div>
              </div>

              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                loading={loading}
                currentUserEmail={user?.email || ''}
                otherUserName={selectedGestorProfile?.nome_gestor || 'Gestor'}
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
