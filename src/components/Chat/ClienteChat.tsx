
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ChatInterface } from './ChatInterface'
import { MobileChatInterface } from './Mobile/MobileChatInterface'

interface ClienteChatProps {
  onBack?: () => void
}

export function ClienteChat({ onBack }: ClienteChatProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  if (!user?.email) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Usuário não autenticado</p>
      </div>
    )
  }

  // Use mobile interface on mobile devices
  if (isMobile) {
    return (
      <MobileChatInterface
        emailCliente={user.email}
        emailGestor="" // Will be determined by the hook
        nomeCliente="Você"
        onBack={onBack}
      />
    )
  }

  // Use desktop interface on desktop
  return (
    <ChatInterface
      emailCliente={user.email}
      emailGestor="" // Will be determined by the hook
      nomeCliente="Você"
      onBack={onBack}
      showBackButton={true}
    />
  )
}
