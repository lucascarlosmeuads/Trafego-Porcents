
import { useMemo } from 'react'
import { useDebounce } from './useDebounce'
import { Cliente } from '@/lib/supabase'

interface UseOptimizedFiltersProps {
  clientes: Cliente[]
  searchTerm: string
  statusFilter: string
  siteStatusFilter: string
  creativoFilter: string
  bmFilter: string
  colorFilter?: string
  clientesComCriativos: Set<string>
}

/**
 * Hook otimizado para filtros com debounce e memoização
 * ETAPA 3: Debounce e Filtros Otimizados
 */
export function useOptimizedFilters({
  clientes,
  searchTerm,
  statusFilter,
  siteStatusFilter,
  creativoFilter,
  bmFilter,
  colorFilter = 'all',
  clientesComCriativos
}: UseOptimizedFiltersProps) {
  
  // Debounce do termo de busca para evitar filtrar a cada tecla
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  console.log('🔍 [useOptimizedFilters] Aplicando filtros otimizados:', {
    totalClientes: clientes.length,
    searchTerm: debouncedSearchTerm,
    statusFilter,
    siteStatusFilter,
    creativoFilter,
    bmFilter
  })

  // Memoização dos clientes filtrados para evitar recálculos desnecessários
  const filteredClientes = useMemo(() => {
    console.log('🚀 [useOptimizedFilters] Recalculando filtros...')
    
    return clientes.filter(cliente => {
      // Filtro de busca (com debounce)
      const matchesSearch = !debouncedSearchTerm || 
        cliente.nome_cliente?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        cliente.email_cliente?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        cliente.telefone?.includes(debouncedSearchTerm) ||
        cliente.vendedor?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      // Filtro de status da campanha
      const matchesStatus = statusFilter === 'all' || cliente.status_campanha === statusFilter
      
      // Filtro de status do site
      const matchesSiteStatus = siteStatusFilter === 'all' || cliente.site_status === siteStatusFilter
      
      // Filtro de criativo
      let matchesCreativo = true
      if (creativoFilter === 'pendente') {
        matchesCreativo = !clientesComCriativos.has(cliente.email_cliente || '')
      } else if (creativoFilter === 'feito') {
        matchesCreativo = clientesComCriativos.has(cliente.email_cliente || '')
      }
      
      // Filtro de BM
      let matchesBm = true
      if (bmFilter === 'com_bm') {
        matchesBm = !!(cliente.numero_bm && cliente.numero_bm.trim() !== '')
      } else if (bmFilter === 'sem_bm') {
        matchesBm = !(cliente.numero_bm && cliente.numero_bm.trim() !== '')
      }

      // Filtro por cor de marcação
      let matchesColor = true
      if (colorFilter !== 'all') {
        if (colorFilter === 'sem-cor') {
          matchesColor = !cliente.cor_marcacao || cliente.cor_marcacao === null
        } else {
          matchesColor = cliente.cor_marcacao === colorFilter
        }
      }
      
      return matchesSearch && matchesStatus && matchesSiteStatus && matchesCreativo && matchesBm && matchesColor
    })
  }, [
    clientes,
    debouncedSearchTerm, // Usar versão com debounce
    statusFilter,
    siteStatusFilter,
    creativoFilter,
    bmFilter,
    colorFilter,
    clientesComCriativos
  ])

  console.log('✅ [useOptimizedFilters] Filtros aplicados:', {
    clientesOriginais: clientes.length,
    clientesFiltrados: filteredClientes.length,
    searchTermUsed: debouncedSearchTerm
  })

  return {
    filteredClientes,
    debouncedSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm // Para mostrar loading durante debounce
  }
}
