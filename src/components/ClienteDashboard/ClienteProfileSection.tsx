
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { ProfileAvatarUpload } from '../ProfileAvatarUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings } from 'lucide-react'

export function ClienteProfileSection() {
  const { user } = useAuth()
  const { profileData, updateProfileData } = useProfileData('cliente')

  const handleAvatarChange = (newUrl: string | null) => {
    updateProfileData({ avatar_url: newUrl })
  }

  return (
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
  )
}
