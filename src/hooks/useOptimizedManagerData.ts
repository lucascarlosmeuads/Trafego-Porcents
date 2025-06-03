
import { useMemo, useCallback } from 'react'
import { useManagerData } from './useManagerData'
import type { Cliente } from '@/lib/supabase'

interface UseOptimizedManagerDataProps {
  userEmail: string
  isAdminUser?: boolean
  selectedManager?: string
  filterType?: 'sites-pendentes' | 'sites-finalizados'
}

interface OptimizedMetrics {
  totalClientes: number
  clientesNoAr: number
  clientesPendentes: number
  totalPendente: number
  clientesPagos: number
  totalRecebido: number
  clientesProblemas: number
  gestorDistribution: Record<string, number>
  statusDistribution: Record<string, number>
}

export function useOptimizedManagerData({
  userEmail,
  isAdminUser = false,
  selectedManager,
  filterType
}: UseOptimizedManagerDataProps) {
  console.log('🧮 [useOptimizedManagerData] Hook de dados otimizado inicializado')
  
  // Usar o hook original
  const {
    clientes,
    loading,
    error,
    refetch,
    updateCliente,
    addCliente,
    currentManager,
    setClientes
  } = useManagerData(userEmail, isAdminUser, selectedManager, filterType)

  // MEMOIZAÇÃO: Cálculos de métricas pesados
  const optimizedMetrics = useMemo((): OptimizedMetrics => {
    console.log('🔄 [useOptimizedManagerData] Recalculando métricas otimizadas para', clientes.length, 'clientes')
    
    const startTime = performance.now()
    
    // Função otimizada para determinar comissão pendente
    const isComissaoPendente = (comissao: string | null | undefined): boolean => {
      return !comissao || comissao.trim() === '' || comissao.trim() !== 'Pago'
    }

    // Usar reduce para fazer todos os cálculos em uma única passada
    const metrics = clientes.reduce((acc, cliente) => {
      // Contadores básicos
      acc.totalClientes++
      
      // Status da campanha
      const status = cliente.status_campanha || ''
      acc.statusDistribution[status] = (acc.statusDistribution[status] || 0) + 1
      
      if (status === 'Campanha no Ar' || status === 'Otimização') {
        acc.clientesNoAr++
      } else if (status === 'Problema') {
        acc.clientesProblemas++
      }
      
      // Comissões
      const valorComissao = cliente.valor_comissao || 60.00
      if (isComissaoPendente(cliente.comissao)) {
        acc.clientesPendentes++
        acc.totalPendente += valorComissao
      } else {
        acc.clientesPagos++
        acc.totalRecebido += valorComissao
      }
      
      // Distribuição por gestor
      const gestor = cliente.email_gestor || 'Sem Gestor'
      acc.gestorDistribution[gestor] = (acc.gestorDistribution[gestor] || 0) + 1
      
      return acc
    }, {
      totalClientes: 0,
      clientesNoAr: 0,
      clientesPendentes: 0,
      totalPendente: 0,
      clientesPagos: 0,
      totalRecebido: 0,
      clientesProblemas: 0,
      gestorDistribution: {} as Record<string, number>,
      statusDistribution: {} as Record<string, number>
    })

    const endTime = performance.now()
    console.log(`⚡ [useOptimizedManagerData] Métricas calculadas em ${(endTime - startTime).toFixed(2)}ms`)
    
    return metrics
  }, [clientes]) // Só recalcula quando clientes mudam

  // MEMOIZAÇÃO: Filtros de clientes comuns
  const filteredClientes = useMemo(() => {
    console.log('🔍 [useOptimizedManagerData] Aplicando filtros memoizados')
    
    return {
      noAr: clientes.filter(c => c.status_campanha === 'Campanha no Ar' || c.status_campanha === 'Otimização'),
      problemas: clientes.filter(c => c.status_campanha === 'Problema'),
      pendentes: clientes.filter(c => !c.comissao || c.comissao.trim() === '' || c.comissao.trim() !== 'Pago'),
      pagos: clientes.filter(c => c.comissao === 'Pago'),
      sitesPendentes: clientes.filter(c => c.site_status === 'aguardando_link'),
      sitesFinalizados: clientes.filter(c => c.site_status === 'finalizado')
    }
  }, [clientes])

  // CALLBACK OTIMIZADO: Função de busca
  const optimizedRefetch = useCallback(() => {
    console.log('🔄 [useOptimizedManagerData] Refetch otimizado chamado')
    return refetch()
  }, [refetch])

  // CALLBACK OTIMIZADO: Atualização de cliente
  const optimizedUpdateCliente = useCallback((id: string, field: string, value: string | boolean | number) => {
    console.log('📝 [useOptimizedManagerData] Update otimizado para cliente:', id, field)
    return updateCliente(id, field, value)
  }, [updateCliente])

  // CALLBACK OTIMIZADO: Adicionar cliente
  const optimizedAddCliente = useCallback((clienteData: any) => {
    console.log('➕ [useOptimizedManagerData] Add cliente otimizado')
    return addCliente(clienteData)
  }, [addCliente])

  console.log('📊 [useOptimizedManagerData] Métricas otimizadas:', {
    total: optimizedMetrics.totalClientes,
    noAr: optimizedMetrics.clientesNoAr,
    pendentes: optimizedMetrics.clientesPendentes,
    problemas: optimizedMetrics.clientesProblemas
  })

  return {
    // Dados originais
    clientes,
    loading,
    error,
    currentManager,
    setClientes,
    
    // Métricas otimizadas
    metrics: optimizedMetrics,
    filteredClientes,
    
    // Callbacks otimizados
    refetch: optimizedRefetch,
    updateCliente: optimizedUpdateCliente,
    addCliente: optimizedAddCliente
  }
}
