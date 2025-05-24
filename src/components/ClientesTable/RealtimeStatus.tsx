
import { Wifi, WifiOff } from 'lucide-react'

interface RealtimeStatusProps {
  isConnected: boolean
}

export function RealtimeStatus({ isConnected }: RealtimeStatusProps) {
  return (
    <div className="flex items-center gap-1">
      {isConnected ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
      <span className="text-xs text-gray-400">
        {isConnected ? 'Online' : 'Offline'}
      </span>
    </div>
  )
}
