
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

export function ClienteProfileSection() {
  const { user } = useAuth()
  const { profileData } = useProfileData('cliente')

  return (
    <Card className="mobile-optimized-card info-card-primary hover-lift">
      <CardContent className="mobile-optimized-p">
        <div className="flex flex-col items-center mobile-optimized-spacing">
          {/* Logo Profissional */}
          <div className="flex justify-center w-full mb-4">
            <img 
              src="/lovable-uploads/e1c8c342-51ea-4eb6-a6bb-b33eefaa2b53.png" 
              alt="Tráfego Por Cents" 
              className="h-16 w-auto object-contain hover-lift transition-transform duration-300"
            />
          </div>
          
          {/* Email Badge Profissional */}
          <div className="text-center">
            <Badge className="professional-badge text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {user?.email?.split('@')[0]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
