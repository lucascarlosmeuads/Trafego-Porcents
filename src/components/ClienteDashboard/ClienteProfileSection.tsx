
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { Card, CardContent } from '@/components/ui/card'

export function ClienteProfileSection() {
  const { user } = useAuth()
  const { profileData } = useProfileData('cliente')

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo da Tráfego Por Cents */}
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/fd16b733-7b5d-498a-b2bd-19347f5f0518.png" 
              alt="Tráfego Por Cents" 
              className="h-16 w-auto object-contain"
            />
          </div>
          
          {/* Informações do usuário */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-white">
              {profileData?.nome_display || 'Cliente'}
            </h3>
            <p className="text-gray-400 text-sm">
              {user?.email}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
