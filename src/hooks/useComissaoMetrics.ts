
import { useMemo } from 'react'
import type { Cliente } from '@/lib/supabase'

export function useComissaoMetrics(clientes: Cliente[], solicitacoesPagas: string[] = []) {
  const metrics = useMemo(() => {
    console.log('📊 [useComissaoMetrics] Calculando métricas para', clientes.length, 'clientes')
    
    // Comissões pendentes - todas que não são "Off", "Reembolso" e não foram pagas
    const comissoesPendentes = clientes.filter(cliente => 
      cliente.status_campanha !== 'Off' && 
      cliente.status_campanha !== 'Reembolso' &&
      !cliente.comissao_paga &&
      !cliente.saque_solicitado
    )

    // Comissões disponíveis para saque - campanhas em "Otimização", não solicitadas ainda e não pagas pelo admin
    const comissoesDisponiveis = clientes.filter(cliente => {
      const disponivel = cliente.status_campanha === 'Otimização' && 
        !cliente.saque_solicitado &&
        !cliente.comissao_paga &&
        !solicitacoesPagas.includes(cliente.id)
      
      if (disponivel) {
        console.log('💰 [useComissaoMetrics] Cliente disponível para saque:', cliente.nome_cliente, {
          status: cliente.status_campanha,
          saque_solicitado: cliente.saque_solicitado,
          comissao_paga: cliente.comissao_paga,
          pago_admin: solicitacoesPagas.includes(cliente.id)
        })
      }
      
      return disponivel
    })

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

    console.log('📈 [useComissaoMetrics] Métricas calculadas:', {
      pendentes: comissoesPendentes.length,
      disponiveis: comissoesDisponiveis.length,
      recebidas: comissoesRecebidas.length,
      totalDisponivel,
      totalPendente,
      totalRecebido
    })

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
