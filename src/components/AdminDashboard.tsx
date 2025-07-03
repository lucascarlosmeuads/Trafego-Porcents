
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ClientesTable } from './ClientesTable'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'
import { ClientesAntigosTab } from './AdminDashboard/ClientesAntigosTab'
import { supabase } from '@/lib/supabase'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user } = useAuth()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('🔍 [AdminDashboard] === DEBUG ADMIN DASHBOARD ===')
  console.log('👤 [AdminDashboard] User email:', user?.email)
  console.log('🎯 [AdminDashboard] Active tab:', activeTab)
  console.log('👨‍💼 [AdminDashboard] Selected manager:', selectedManager)

  useEffect(() => {
    fetchClientes()
  }, [selectedManager])

  const fetchClientes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedManager && selectedManager !== 'Todos os Gestores' && selectedManager !== 'Todos os Clientes') {
        query = query.eq('email_gestor', selectedManager)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [AdminDashboard] Erro ao buscar clientes:', error)
        return
      }

      setClientes(data || [])
    } catch (error) {
      console.error('💥 [AdminDashboard] Erro crítico:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboardMetrics 
            clientes={clientes}
            selectedManager={selectedManager}
          />
        )
      case 'clientes':
        return (
          <div className="bg-gray-950 min-h-screen">
            <ClientesTable 
              selectedManager={selectedManager}
              onManagerSelect={onManagerSelect}
            />
          </div>
        )
      case 'clientes-antigos':
        return <ClientesAntigosTab />
      case 'sac':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">SAC Dashboard</h2>
            <p className="text-gray-400">Módulo SAC em desenvolvimento...</p>
          </div>
        )
      default:
        return (
          <AdminDashboardMetrics 
            clientes={clientes}
            selectedManager={selectedManager}
          />
        )
    }
  }

  return (
    <div className="bg-gray-950 min-h-screen p-6">
      {renderContent()}
    </div>
  )
}

export default AdminDashboard
