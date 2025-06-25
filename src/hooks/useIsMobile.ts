
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const checkIsMobile = () => {
      // Verificar tanto o tamanho da tela quanto user agent para melhor detecção
      const screenIsMobile = window.innerWidth < breakpoint
      const userAgentIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Considerar mobile se QUALQUER uma das condições for verdadeira
      setIsMobile(screenIsMobile || userAgentIsMobile || (touchDevice && window.innerWidth < 1200))
    }

    // Check initial
    checkIsMobile()

    // Add event listener
    window.addEventListener('resize', checkIsMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [breakpoint])

  return isMobile
}
