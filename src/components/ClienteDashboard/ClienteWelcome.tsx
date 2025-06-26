
import { useAuth } from '@/hooks/useAuth'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { OnboardingSteps } from './OnboardingSteps'
import { MobileOnboardingSteps } from './MobileOnboardingSteps'
import { AvisoMudancaAtendimento } from './AvisoMudancaAtendimento'
import { CampanhaLinkCard } from './CampanhaLinkCard'
import { MensagemInstitucional } from './MensagemInstitucional'
import { ClienteWelcomeHeader } from './ClienteWelcomeHeader'
import { ClienteProfileSection } from './ClienteProfileSection'
import { ClienteQuickActions } from './ClienteQuickActions'
import { SiteRequestPrompt } from './SiteRequestPrompt'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const { user } = useAuth()
  const { cliente, loading } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()

  // Layout Mobile Premium
  if (isMobile) {
    return (
      <div className="pb-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black min-h-screen">
        {/* Header Premium Mobile */}
        <div className="mobile-safe">
          <ClienteWelcomeHeader className="rounded-b-3xl" />
        </div>
        
        {/* Mensagem Institucional - Mobile */}
        <div className="p-4">
          <MensagemInstitucional />
        </div>
        
        <AvisoMudancaAtendimento />
        
        {/* Card da campanha se existir */}
        <div className="p-4 space-y-4">
          {!loading && cliente?.link_campanha && (
            <CampanhaLinkCard linkCampanha={cliente.link_campanha} />
          )}
        </div>
        
        <MobileOnboardingSteps onTabChange={onTabChange} />
        
        {/* Prompt de Site no final */}
        <div className="p-4">
          <SiteRequestPrompt />
        </div>
      </div>
    )
  }

  // Layout Desktop Premium
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header Premium Desktop */}
      <ClienteWelcomeHeader />

      {/* Conteúdo Principal */}
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Mensagem Institucional - Desktop */}
        <MensagemInstitucional />

        {/* Aviso de Mudança */}
        <AvisoMudancaAtendimento />

        {/* Card da Campanha */}
        {!loading && cliente?.link_campanha && (
          <CampanhaLinkCard linkCampanha={cliente.link_campanha} />
        )}

        {/* Seção de Perfil Premium */}
        <ClienteProfileSection />

        {/* Componente de Onboarding Premium */}
        <OnboardingSteps onTabChange={onTabChange} />

        {/* Grid de Ações Rápidas Premium */}
        <ClienteQuickActions onTabChange={onTabChange} />

        {/* Prompt de Site Premium */}
        <div className="max-w-4xl mx-auto">
          <SiteRequestPrompt />
        </div>
      </div>
      
      {/* Footer Premium */}
      <div className="mt-12 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Tráfego Porcents - Sua parceira em alta performance digital
          </p>
        </div>
      </div>
    </div>
  )
}
