
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useManagerData } from '@/hooks/useManagerData'
import { useProfileData } from '@/hooks/useProfileData'
import { ClientesTable } from './ClientesTable'
import { GamifiedMetrics } from './GestorDashboard/GamifiedMetrics'
import { ChatLayoutSplit } from './Chat/ChatLayoutSplit'
import { GestorSacDashboard } from './SAC/GestorSacDashboard'
import { SugestoesDashboard } from './SugestoesDashboard'
import { MetaAdsGestor } from './MetaAds/MetaAdsGestor'
import { ProfileAvatarUpload } from './ProfileAvatarUpload'
import { AvisoSistemasSAC } from './GestorDashboard/AvisoSistemasSAC'
import { AvisoMudancaStatus } from './GestorDashboard/AvisoMudancaStatus'
import { useOptimizedComponents } from '@/hooks/useOptimizedComponents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'

interface GestorDashboardProps {
  activeTab: string
}

export function GestorDashboard({ activeTab }: GestorDashboardProps) {
  const { user } = useAuth()
  const { clientes, loading } = useManagerData(user?.email || '')
  const { profileData, updateProfileData } = useProfileData('gestor')
  const { useOptimized } = useOptimizedComponents()

  console.log('🔍 [GestorDashboard] === DEBUG GESTOR DASHBOARD ===')
  console.log('👤 [GestorDashboard] User email:', user?.email)
  console.log('📊 [GestorDashboard] Total clientes:', clientes.length)
  console.log('⏳ [GestorDashboard] Loading:', loading)
  console.log('🎯 [GestorDashboard] Active tab:', activeTab)
  console.log('⚡ [GestorDashboard] Usando componentes otimizados:', useOptimized)
  console.log('👤 [GestorDashboard] Profile data:', profileData)

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  const renderContent = () => {
    if (loading && (activeTab === 'dashboard' || activeTab === 'clientes')) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
            <p className="text-gray-300">Carregando dados...</p>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Avisos Importantes para Gestores */}
            <AvisoSistemasSAC />
            <AvisoMudancaStatus />
            
            {/* Seção de Perfil */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <ProfileAvatarUpload
                    currentAvatarUrl={profileData?.avatar_url}
                    userName={profileData?.nome_display || user?.email || 'Gestor'}
                    userType="gestor"
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    showEditButton={true}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {profileData?.nome_display || 'Gestor'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {user?.email}
                    </p>
                    <p className="text-purple-400 text-xs">
                      ✅ Gestor ativo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <GamifiedMetrics clientes={clientes} />
          </div>
        )
      case 'clientes':
        return (
          <div className="bg-gray-950 min-h-screen">
            <ClientesTable />
          </div>
        )
      case 'meta-ads':
        return (
          <div className="bg-gray-950 min-h-screen">
            <MetaAdsGestor />
          </div>
        )
      case 'sac':
        return <GestorSacDashboard />
      case 'chat':
        return (
          <div className="bg-gray-950 min-h-screen">
            <ChatLayoutSplit />
          </div>
        )
      case 'sugestoes':
        return (
          <div className="bg-gray-950 min-h-screen p-6">
            <SugestoesDashboard />
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            {/* Avisos Importantes para Gestores */}
            <AvisoSistemasSAC />
            <AvisoMudancaStatus />
            
            {/* Seção de Perfil */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <ProfileAvatarUpload
                    currentAvatarUrl={profileData?.avatar_url}
                    userName={profileData?.nome_display || user?.email || 'Gestor'}
                    userType="gestor"
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    showEditButton={true}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {profileData?.nome_display || 'Gestor'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {user?.email}
                    </p>
                    <p className="text-purple-400 text-xs">
                      ✅ Gestor ativo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <GamifiedMetrics clientes={clientes} />
          </div>
        )
    }
  }

  return (
    <div className="bg-gray-950 min-h-screen p-6">
      {renderContent()}
    </div>
  )
}

// Add default export for lazy loading
export default GestorDashboard
