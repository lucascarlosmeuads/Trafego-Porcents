
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ClientesTable } from './ClientesTable'

export function GestorDashboard() {
  const { user, currentManagerName } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <ClientesTable selectedManager={currentManagerName} />
    </div>
  )
}
