
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkIsMobile = () => {
      // Melhor detecção mobile com múltiplos critérios
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const screenIsMobile = screenWidth < breakpoint
      const userAgentIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const aspectRatio = screenWidth / screenHeight
      
      // Considerar mobile se:
      // - Largura menor que breakpoint OU
      // - User agent mobile OU
      // - Device touch E largura menor que 1200px OU
      // - Aspect ratio típico de mobile (mais alto que largo) E largura menor que 900px
      const isMobileDevice = screenIsMobile || 
                           userAgentIsMobile || 
                           (touchDevice && screenWidth < 1200) ||
                           (aspectRatio < 1 && screenWidth < 900)
      
      setIsMobile(isMobileDevice)
    }

    // Check initial
    checkIsMobile()

    // Add event listener with throttling
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkIsMobile, 150)
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
