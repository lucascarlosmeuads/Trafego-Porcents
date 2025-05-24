import { useState, useEffect } from 'react'
import { useManagerData } from '@/hooks/useManagerData'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { ProblemasPanel } from './ProblemasPanel'

interface AdminDashboardProps {
  selectedManager: string | null
}

export function AdminDashboard({ selectedManager }: AdminDashboardProps) {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  // Se o manager selecionado for '__PROBLEMAS__', mostrar o painel de problemas
  if (selectedManager === '__PROBLEMAS__') {
    return (
      <div className="space-y-6">
        <ProblemasPanel />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClientesTable selectedManager={selectedManager} />
    </div>
  )
}
