import { useState, useMemo, useCallback } from 'react'
import type { DateRange } from '@/components/GestorDashboard/MetricsDateFilter'
import type { Cliente } from '@/lib/supabase'

export function useMetricsDateFilter() {
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(() => {
    // Inicializar com últimos 30 dias
    const hoje = new Date()
    const start = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))
    return {
      startDate: start,
      endDate: hoje,
      preset: 'last_30_days',
      label: 'Últimos 30 dias'
    }
  })

  const handleDateRangeChange = useCallback((dateRange: DateRange) => {
    setCurrentDateRange(dateRange)
  }, [])

  // Filtrar clientes baseado no período selecionado
  const filterClientesByDateRange = useCallback((clientes: Cliente[], dateRange: DateRange) => {
    return clientes.filter(cliente => {
      const dataCliente = new Date(cliente.created_at)
      return dataCliente >= dateRange.startDate && dataCliente <= dateRange.endDate
    })
  }, [])

  // Calcular dados do período atual
  const getMetricsData = useCallback((clientes: Cliente[]) => {
    const clientesFiltrados = filterClientesByDateRange(clientes, currentDateRange)
    
    // Calcular dias no período
    const diasNoPeriodo = Math.ceil((currentDateRange.endDate.getTime() - currentDateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Para cálculo de vendas diárias necessárias, usar dias restantes no mês atual se for período mensal
    const hoje = new Date()
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
    const diaAtual = hoje.getDate()
    const diasRestantesNoMes = ultimoDiaDoMes - diaAtual + 1

    const diasParaCalculoVendas = currentDateRange.preset === 'this_month' || currentDateRange.preset === 'last_30_days' 
      ? diasRestantesNoMes 
      : diasNoPeriodo

    return {
      clientesFiltrados,
      diasNoPeriodo,
      diasParaCalculoVendas,
      currentDateRange
    }
  }, [currentDateRange, filterClientesByDateRange])

  // Verificar se período é do mês atual (para manter lógica de meta mensal)
  const isCurrentMonthPeriod = useMemo(() => {
    const hoje = new Date()
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    
    return currentDateRange.preset === 'this_month' || 
           currentDateRange.preset === 'last_30_days' ||
           (currentDateRange.startDate >= inicioMesAtual)
  }, [currentDateRange])

  return {
    currentDateRange,
    handleDateRangeChange,
    getMetricsData,
    isCurrentMonthPeriod
  }
}