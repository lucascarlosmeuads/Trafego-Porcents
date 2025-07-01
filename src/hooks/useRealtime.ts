
import { useState, useEffect } from 'react'

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(true)
  
  useEffect(() => {
    // Mock connection status - em um cenário real, isso seria conectado ao Supabase realtime
    setIsConnected(true)
  }, [])
  
  return { isConnected }
}
