
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { useClienteData } from '@/hooks/useClienteData'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ProfileAvatarUpload } from '../ProfileAvatarUpload'
import { OnboardingSteps } from './OnboardingSteps'
import { MobileOnboardingSteps } from './MobileOnboardingSteps'
import { AvisoMudancaAtendimento } from './AvisoMudancaAtendimento'
import { SiteRequestCard } from './SiteRequestCard'
import { CampanhaLinkCard } from './CampanhaLinkCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Upload, TrendingUp, Play, Headphones, User, Settings } from 'lucide-react'

interface ClienteWelcomeProps {
  onTabChange: (tab: string) => void
}

export function ClienteWelcome({ onTabChange }: ClienteWelcomeProps) {
  const { user } = useAuth()
  const { profileData, updateProfileData } = useProfileData('cliente')
  const { cliente, loading } = useClienteData(user?.email || '')
  const isMobile = useIsMobile()

  const quickActions = [
    {
      title: 'Preencher Briefing',
      description: 'Complete as informações do seu projeto',
      icon: FileText,
      action: () => onTabChange('briefing'),
      color: 'bg-blue-500'
    },
    {
      title: 'Enviar Materiais',
      description: 'Faça upload de logos, fotos e outros materiais',
      icon: Upload,
      action: () => onTabChange('arquivos'),
      color: 'bg-green-500'
    },
    {
      title: 'Registrar Vendas',
      description: 'Acompanhe o desempenho das suas campanhas',
      icon: TrendingUp,
      action: () => onTabChange('vendas'),
      color: 'bg-purple-500'
    },
    {
      title: 'Assistir Tutoriais',
      description: 'Aprenda com nossos vídeos explicativos',
      icon: Play,
      action: () => onTabChange('tutoriais'),
      color: 'bg-orange-500'
    },
    {
      title: 'Suporte Rápido',
      description: 'Acesse nossa central de atendimento via SAC para tirar dúvidas e receber suporte',
      icon: Headphones,
      action: () => onTabChange('suporte'),
      color: 'bg-teal-500'
    }
  ]

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  // Se for mobile, usar componente simplificado
  if (isMobile) {
    return (
      <div className="pb-20"> {/* Espaço para navegação inferior */}
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

  // Versão desktop mantida igual
  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Header de Boas-vindas */}
      <div className="text-center space-y-4">
        <div className="inline-block">
          <div className="relative group cursor-pointer mb-4">
            <div className="absolute inset-0 bg-gradient-hero rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-hero text-white rounded-2xl font-bold px-8 py-4 text-2xl transition-transform duration-300 hover:scale-105">
              <span>Tráfego</span>
              <span className="text-orange-300">Porcents</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo ao seu painel! 🎉
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Aqui você pode acompanhar o progresso da sua campanha, enviar materiais, 
          preencher o briefing e muito mais. Vamos começar?
        </p>
      </div>

      {/* Aviso de Mudança */}
      <AvisoMudancaAtendimento />

      {/* Card de Solicitação de Site */}
      <SiteRequestCard />

      {/* Card da Campanha - NOVO */}
      {!loading && cliente?.link_campanha && (
        <CampanhaLinkCard linkCampanha={cliente.link_campanha} />
      )}

      {/* Seção de Perfil */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Seu Perfil
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gerencie suas informações pessoais e foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfileAvatarUpload
                currentAvatarUrl={profileData?.avatar_url}
                userName={profileData?.nome_display || user?.email || 'Cliente'}
                userType="cliente"
                onAvatarChange={handleAvatarChange}
                size="lg"
                showEditButton={true}
              />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {profileData?.nome_display || 'Cliente'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {user?.email}
                </p>
                <p className="text-teal-400 text-xs">
                  ✅ Conta ativa
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Onboarding Interativo */}
      <OnboardingSteps onTabChange={onTabChange} />

      {/* Grid de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer group"
            onClick={action.action}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
