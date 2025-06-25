
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { OnboardingSteps } from './OnboardingSteps'
import { MobileOnboardingSteps } from './MobileOnboardingSteps'
import { AvisoMudancaAtendimento } from './AvisoMudancaAtendimento'
import { SiteRequestCard } from './SiteRequestCard'
import { CampanhaLinkCard } from './CampanhaLinkCard'
import { MensagemInstitucional } from './MensagemInstitucional'
import { ClienteWelcomeHeader } from './ClienteWelcomeHeader'
import { ClienteProfileSection } from './ClienteProfileSection'
import { ClienteQuickActions } from './ClienteQuickActions'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const { user } = useAuth()
  const { cliente, loading } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()

  // Se for mobile, usar componente simplificado
  if (isMobile) {
    return (
      <div className="pb-20"> {/* Espaço para navegação inferior */}
        {/* Mensagem Institucional - Mobile */}
        <div className="p-4">
          <MensagemInstitucional />
        </div>
        
        <AvisoMudancaAtendimento />
        
        {/* Card de solicitação de site para mobile */}
        <div className="p-4 space-y-4">
          <SiteRequestCard />
          
          {/* Card da campanha se existir */}
          {!loading && cliente?.link_campanha && (
            <CampanhaLinkCard linkCampanha={cliente.link_campanha} />
          )}
        </div>
        
        <MobileOnboardingSteps onTabChange={onTabChange} />
      </div>
    )
  }

  // Versão desktop
  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header de Boas-vindas */}
      <ClienteWelcomeHeader />

      {/* Mensagem Institucional - Desktop */}
      <MensagemInstitucional />

      {/* Aviso de Mudança */}
      <AvisoMudancaAtendimento />

      {/* Card de Solicitação de Site */}
      <SiteRequestCard />

      {/* Card da Campanha */}
      {!loading && cliente?.link_campanha && (
        <CampanhaLinkCard linkCampanha={cliente.link_campanha} />
      )}

      {/* Seção de Perfil */}
      <ClienteProfileSection />

      {/* Componente de Onboarding Interativo */}
      <OnboardingSteps onTabChange={onTabChange} />

      {/* Grid de Ações Rápidas */}
      <ClienteQuickActions onTabChange={onTabChange} />
    </div>
  )
}
