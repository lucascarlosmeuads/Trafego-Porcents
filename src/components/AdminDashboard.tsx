
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { OptimizedAdminDashboard } from './AdminDashboard/OptimizedAdminDashboard'
import { LoadingFallback } from './LoadingFallback'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  console.log('🚀 [AdminDashboard] === CARREGANDO DASHBOARD ADMIN OTIMIZADO ===')
  console.log('👤 [AdminDashboard] User:', user?.email)
  console.log('🔒 [AdminDashboard] Is Admin:', isAdmin)
  console.log('🎯 [AdminDashboard] Selected Manager:', selectedManager)
  console.log('📑 [AdminDashboard] Active Tab:', activeTab)

  useEffect(() => {
    if (user && isAdmin) {
      console.log('✅ [AdminDashboard] Admin autenticado, carregando dashboard otimizado')
      setLoading(false)
    }
  }, [user, isAdmin])

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <OptimizedAdminDashboard
        selectedManager={selectedManager}
        onManagerSelect={onManagerSelect}
        activeTab={activeTab}
      />
    </Suspense>
  )
}

// Add default export for lazy loading
export default AdminDashboard
