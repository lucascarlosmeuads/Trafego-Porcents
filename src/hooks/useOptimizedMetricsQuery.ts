
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { QUERY_KEYS } from './useOptimizedReactQuery'
import type { Cliente } from '@/lib/supabase'

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

export function useOptimizedMetricsQuery(
  clientes: Cliente[],
  userEmail: string,
  selectedManager?: string
) {
  console.log('📊 [useOptimizedMetricsQuery] Métricas com React Query cache')

  // QUERY OTIMIZADA: Métricas derivadas com cache separado
  const { data: metrics, isLoading } = useQuery({
    queryKey: QUERY_KEYS.metrics(userEmail, selectedManager),
    queryFn: (): OptimizedMetrics => {
      console.log('🧮 [useOptimizedMetricsQuery] Calculando métricas (cached)')
      const startTime = performance.now()

      const isComissaoPendente = (comissao: string | null | undefined): boolean => {
        return !comissao || comissao.trim() === '' || comissao.trim() !== 'Pago'
      }

      // Cálculo otimizado em uma única passada
      const metrics = clientes.reduce((acc, cliente) => {
        acc.totalClientes++
        
        const status = cliente.status_campanha || ''
        acc.statusDistribution[status] = (acc.statusDistribution[status] || 0) + 1
        
        if (status === 'Campanha no Ar' || status === 'Otimização') {
          acc.clientesNoAr++
        } else if (status === 'Problema') {
          acc.clientesProblemas++
        }
        
        const valorComissao = cliente.valor_comissao || 60.00
        if (isComissaoPendente(cliente.comissao)) {
          acc.clientesPendentes++
          acc.totalPendente += valorComissao
        } else {
          acc.clientesPagos++
          acc.totalRecebido += valorComissao
        }
        
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
      console.log(`⚡ [useOptimizedMetricsQuery] Métricas calculadas em ${(endTime - startTime).toFixed(2)}ms`)
      
      return metrics
    },
    enabled: clientes.length > 0,
    staleTime: 60 * 1000, // 1 minuto - métricas podem ficar um pouco mais tempo
    gcTime: 10 * 60 * 1000, // 10 minutos no cache
    refetchOnWindowFocus: false
  })

  // MEMOIZAÇÃO: Filtros derivados das métricas
  const filteredClientes = useMemo(() => {
    console.log('🔍 [useOptimizedMetricsQuery] Aplicando filtros memoizados')
    
    return {
      noAr: clientes.filter(c => c.status_campanha === 'Campanha no Ar' || c.status_campanha === 'Otimização'),
      problemas: clientes.filter(c => c.status_campanha === 'Problema'),
      pendentes: clientes.filter(c => !c.comissao || c.comissao.trim() === '' || c.comissao.trim() !== 'Pago'),
      pagos: clientes.filter(c => c.comissao === 'Pago'),
      sitesPendentes: clientes.filter(c => c.site_status === 'aguardando_link'),
      sitesFinalizados: clientes.filter(c => c.site_status === 'finalizado')
    }
  }, [clientes])

  return {
    metrics: metrics || {
      totalClientes: 0,
      clientesNoAr: 0,
      clientesPendentes: 0,
      totalPendente: 0,
      clientesPagos: 0,
      totalRecebido: 0,
      clientesProblemas: 0,
      gestorDistribution: {},
      statusDistribution: {}
    },
    filteredClientes,
    isLoading
  }
}
