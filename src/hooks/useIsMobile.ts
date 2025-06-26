
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkIsMobile = () => {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // Priorizar largura da tela para desktop/mobile
      if (screenWidth >= breakpoint) {
        // Se tela é grande, considerar desktop independente de outros fatores
        setIsMobile(false)
        return
      }
      
      // Se tela é pequena, aplicar lógica mobile mais refinada
      const userAgentIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const aspectRatio = screenWidth / screenHeight
      
      // Considerar mobile se largura < breakpoint E (tem user agent mobile OU é touch device OU aspect ratio mobile)
      const isMobileDevice = screenWidth < breakpoint && (
        userAgentIsMobile || 
        (touchDevice && screenWidth < 900) ||
        (aspectRatio < 1.3 && screenWidth < 768)
      )
      
      setIsMobile(isMobileDevice)
    }

    // Check initial
    checkIsMobile()

    // Add event listener with throttling
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkIsMobile, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', checkIsMobile)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', checkIsMobile)
      clearTimeout(timeoutId)
    }
  }, [breakpoint])

  return isMobile
}
