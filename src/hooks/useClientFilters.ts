
import { useState, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import { Cliente } from '@/lib/supabase'

export function useClientFilters(clientes: Cliente[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteStatusFilter, setSiteStatusFilter] = useState('all')

  // Debounce search term para evitar consultas desnecessárias
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredClientes = useMemo(() => {
    console.log('🔄 [useClientFilters] Aplicando filtros...')
    
    return clientes.filter(cliente => {
      // Filtro de busca por texto
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        const matchesSearch = 
          cliente.nome_cliente?.toLowerCase().includes(searchLower) ||
          cliente.email_cliente?.toLowerCase().includes(searchLower) ||
          cliente.telefone?.toLowerCase().includes(searchLower) ||
          cliente.vendedor?.toLowerCase().includes(searchLower) ||
          cliente.email_gestor?.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Filtro de status da campanha
      if (statusFilter !== 'all') {
        if (cliente.status_campanha !== statusFilter) return false
      }

      // Filtro de status do site
      if (siteStatusFilter !== 'all') {
        if (cliente.site_status !== siteStatusFilter) return false
      }

      return true
    })
  }, [clientes, debouncedSearchTerm, statusFilter, siteStatusFilter])

  console.log(`📊 [useClientFilters] ${clientes.length} clientes -> ${filteredClientes.length} filtrados`)

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    siteStatusFilter,
    setSiteStatusFilter,
    filteredClientes,
    debouncedSearchTerm
  }
}
