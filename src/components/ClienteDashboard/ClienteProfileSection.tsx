
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { Card, CardContent } from '@/components/ui/card'

export function ClienteProfileSection() {
  const { user } = useAuth()
  const { profileData } = useProfileData('cliente')

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col items-center space-y-2">
          {/* Logo da Tráfego Por Cents - TAMANHO OTIMIZADO PARA MOBILE */}
          <div className="flex justify-center w-full">
            <img 
              src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
              alt="Tráfego Por Cents" 
              className="h-16 w-auto object-contain max-w-full"
            />
          </div>
          
          {/* Email do usuário - bem fosco como fundo */}
          <div className="text-center">
            <p className="text-gray-500 text-xs opacity-30">
              {user?.email}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
