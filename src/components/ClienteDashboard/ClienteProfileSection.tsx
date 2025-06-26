
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { ProfileAvatarUpload } from '../ProfileAvatarUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, Crown } from 'lucide-react'

export function ClienteProfileSection() {
  const { user } = useAuth()
  const { profileData, updateProfileData } = useProfileData('cliente')

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-gray-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
      {/* Header premium */}
      <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-slate-700/50">
        <CardTitle className="text-white flex items-center gap-3 text-xl">
          <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <User className="h-5 w-5 text-blue-400" />
          </div>
          <span>Seu Perfil</span>
          <Crown className="h-5 w-5 text-yellow-500 ml-auto" />
        </CardTitle>
        <CardDescription className="text-gray-300">
          Gerencie suas informações pessoais e foto de perfil
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar com efeito premium */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-30"></div>
              <ProfileAvatarUpload
                currentAvatarUrl={profileData?.avatar_url}
                userName={profileData?.nome_display || user?.email || 'Cliente'}
                userType="cliente"
                onAvatarChange={handleAvatarChange}
                size="lg"
                showEditButton={true}
              />
            </div>
            
            {/* Informações do usuário */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-white">
                  {profileData?.nome_display || 'Cliente'}
                </h3>
                <div className="px-3 py-1 bg-green-600/20 rounded-full border border-green-500/30">
                  <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Conta Ativa
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Crown className="h-3 w-3" />
                <span>Cliente Premium</span>
              </div>
            </div>
          </div>
          
          {/* Botão de configurações premium */}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 bg-slate-800/50 text-gray-300 hover:text-white hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
        
        {/* Barra decorativa */}
        <div className="mt-6 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full opacity-30"></div>
      </CardContent>
    </Card>
  )
}
