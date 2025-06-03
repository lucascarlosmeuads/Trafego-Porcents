
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Phone, MoreVertical } from 'lucide-react'

interface MobileChatHeaderProps {
  userName: string
  userAvatar?: string
  isOnline?: boolean
  statusCampanha?: string
  onBack?: () => void
}

export function MobileChatHeader({
  userName,
  userAvatar,
  isOnline = false,
  statusCampanha,
  onBack
}: MobileChatHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-3 py-3 flex items-center gap-3 min-h-[60px]">
      {onBack && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white hover:bg-gray-800 flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar || undefined} alt={userName} />
            <AvatarFallback className="bg-trafego-accent-primary/20 text-trafego-accent-primary text-sm">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-base truncate">
            {userName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-green-400 text-xs">
              {isOnline ? 'online' : 'visto por último há pouco'}
            </span>
            {statusCampanha && (
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300"
              >
                {statusCampanha}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-gray-800"
          disabled
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-gray-800"
          disabled
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
