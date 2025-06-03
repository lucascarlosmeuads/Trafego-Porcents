
import React, { Suspense, useState, useCallback } from 'react'
import { LoadingFallback } from '../LoadingFallback'
import { LazyStatusFunnelDashboard } from '../LazyComponents'

interface LazyTabContentProps {
  tabName: string
  isActive: boolean
  children: React.ReactNode
}

// OTIMIZAÇÃO: Só carrega o conteúdo da aba quando ela é acessada pela primeira vez
export const LazyTabContent = React.memo(function LazyTabContent({ 
  tabName, 
  isActive, 
  children 
}: LazyTabContentProps) {
  const [hasBeenActive, setHasBeenActive] = useState(isActive)

  // Memoriza se a aba já foi ativada alguma vez
  React.useEffect(() => {
    if (isActive && !hasBeenActive) {
      console.log(`🚀 [LazyTabContent] Primeira ativação da aba: ${tabName}`)
      setHasBeenActive(true)
    }
  }, [isActive, hasBeenActive, tabName])

  // Se nunca foi ativada, não renderiza nada
  if (!hasBeenActive) {
    return null
  }

  // Se foi ativada mas não está ativa agora, mantém o conteúdo renderizado (cache)
  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </div>
  )
})

// Componente específico para Status Funnel com lazy loading
export const LazyStatusFunnelTab = React.memo(function LazyStatusFunnelTab({ 
  isActive 
}: { 
  isActive: boolean 
}) {
  return (
    <LazyTabContent tabName="status-funnel" isActive={isActive}>
      <LazyStatusFunnelDashboard />
    </LazyTabContent>
  )
})
