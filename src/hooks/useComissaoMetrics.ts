
import { useMemo } from 'react'
import type { Cliente } from '@/lib/supabase'

export function useComissaoMetrics(clientes: Cliente[]) {
  const metrics = useMemo(() => {
    // 💰 Total Pendente: comissões em vermelho que ainda podem ser editadas
    // (todos os status exceto "No Ar", "Off", "Reembolso" e que não estão pagas)
    const comissoesPendentes = clientes.filter(cliente => 
      cliente.status_campanha !== 'No Ar' && 
      cliente.status_campanha !== 'Off' && 
      cliente.status_campanha !== 'Reembolso' &&
      !cliente.comissao_paga
    )

    // 🟢 Disponível para Saque: comissões com status "No Ar" que ainda não foram solicitadas
    const comissoesDisponiveis = clientes.filter(cliente => 
      cliente.status_campanha === 'No Ar' && 
      !cliente.saque_solicitado &&
      !cliente.comissao_paga
    )

    const totalPendente = comissoesPendentes.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 0), 0
    )

    const totalDisponivel = comissoesDisponiveis.reduce((total, cliente) => 
      total + (cliente.valor_comissao || 0), 0
    )

    return {
      comissoesPendentes: comissoesPendentes.length,
      comissoesDisponiveis: comissoesDisponiveis.length,
      totalPendente,
      totalDisponivel
    }
  }, [clientes])

  return metrics
}
