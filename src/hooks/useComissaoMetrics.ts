
import { useMemo } from 'react'
import type { Cliente } from '@/lib/supabase'

export function useComissaoMetrics(clientes: Cliente[], solicitacoesPagas: string[] = []) {
  const metrics = useMemo(() => {
    // Comissões pendentes - todas que não estão "No Ar", não são "Off", "Reembolso" e não foram pagas
    const comissoesPendentes = clientes.filter(cliente => 
      cliente.status_campanha !== 'No Ar' && 
      cliente.status_campanha !== 'Off' && 
      cliente.status_campanha !== 'Reembolso' &&
      !cliente.comissao_paga
    )

    // Comissões disponíveis para saque - status "No Ar", não solicitadas ainda e não pagas pelo admin
    const comissoesDisponiveis = clientes.filter(cliente => 
      cliente.status_campanha === 'No Ar' && 
      !cliente.saque_solicitado &&
      !cliente.comissao_paga &&
      !solicitacoesPagas.includes(cliente.id)
    )

    // Comissões já recebidas - marcadas como pagas pelo admin
    const comissoesRecebidas = clientes.filter(cliente => 
      solicitacoesPagas.includes(cliente.id) || cliente.comissao_paga
    )

    const totalPendente = comissoesPendentes.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 0), 0
    )

    const totalDisponivel = comissoesDisponiveis.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 0), 0
    )

    const totalRecebido = comissoesRecebidas.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 0), 0
    )

    return {
      comissoesPendentes: comissoesPendentes.length,
      comissoesDisponiveis: comissoesDisponiveis.length,
      comissoesRecebidas: comissoesRecebidas.length,
      totalPendente,
      totalDisponivel,
      totalRecebido
    }
  }, [clientes, solicitacoesPagas])

  return metrics
}
