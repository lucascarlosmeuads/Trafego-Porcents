import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminTableLogic } from '@/hooks/useAdminTableLogic'
import { ClientesTable } from './ClientesTable'
import { AdminDashboardMetrics } from './AdminDashboard/AdminDashboardMetrics'
import { AdminSacDashboard } from './SAC/AdminSacDashboard'
import { ClientesAntigosTab } from './AdminDashboard/ClientesAntigosTab'

interface AdminDashboardProps {
  selectedManager: string | null
  onManagerSelect: (manager: string | null) => void
  activeTab: string
}

export function AdminDashboard({ selectedManager, onManagerSelect, activeTab }: AdminDashboardProps) {
  const { user } = useAuth()
  const { 
    clientes,
    loading,
    totalClientes,
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    selectedStatus,
    setSelectedStatus,
    selectedVendedor,
    setSelectedVendedor,
    vendedoresList,
    refetchData,
    clearFilters,
    isTableVisible,
    setIsTableVisible,
    isFilterVisible,
    setIsFilterVisible
  } = useAdminTableLogic()

  console.log('🔍 [AdminDashboard] === DEBUG ADMIN DASHBOARD ===')
  console.log('👤 [AdminDashboard] User email:', user?.email)
  console.log('🎯 [AdminDashboard] Active tab:', activeTab)
  console.log('👨‍💼 [AdminDashboard] Selected manager:', selectedManager)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboardMetrics 
            selectedManager={selectedManager}
            onManagerSelect={onManagerSelect}
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
        return <AdminSacDashboard />
      default:
        return (
          <AdminDashboardMetrics 
            selectedManager={selectedManager}
            onManagerSelect={onManagerSelect}
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
