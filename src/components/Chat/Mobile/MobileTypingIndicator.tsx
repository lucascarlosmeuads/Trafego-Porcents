
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface MobileTypingIndicatorProps {
  userName: string
  userAvatar?: string
}

export function MobileTypingIndicator({ userName, userAvatar }: MobileTypingIndicatorProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-end gap-2 mb-4">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={userAvatar || undefined} alt={userName} />
        <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>

      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md max-w-[120px]">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
