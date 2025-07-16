
import { Cliente } from '@/lib/supabase'

export function validateSecurityForNonAdmin(data: any[], userEmail: string, isAdmin: boolean): boolean {
  if (isAdmin) return true // Admins bypass security checks

  for (const item of data) {
    if (item.email_gestor !== userEmail) {
      console.error('🚨 [validateSecurityForNonAdmin] ERRO DE SEGURANÇA: Dados inconsistentes detectados!', {
        userEmail,
        itemEmailGestor: item.email_gestor,
        itemId: item.id,
        itemName: item.nome_cliente
      })
      return false
    }
  }
  return true
}

export function formatCliente(item: any): Cliente | null {
  if (!item) return null

  try {
    // CORREÇÃO 3: Melhorar a formatação do campo eh_ultimo_pago com logging
    const ehUltimoPago = Boolean(item.eh_ultimo_pago === true)
    
    console.log('📋 [formatCliente] Formatando cliente:', {
      id: item.id,
      nome: item.nome_cliente,
      eh_ultimo_pago_original: item.eh_ultimo_pago,
      eh_ultimo_pago_formatado: ehUltimoPago,
      tipo_original: typeof item.eh_ultimo_pago
    })

    return {
      id: String(item.id || ''),
      data_venda: item.data_venda || '',
      nome_cliente: item.nome_cliente || '',
      telefone: item.telefone || '',
      email_cliente: item.email_cliente || '',
      vendedor: item.vendedor || '',
      email_gestor: item.email_gestor || '',
      status_campanha: item.status_campanha || 'Preenchimento do Formulário',
      data_limite: item.data_limite || '',
      link_grupo: item.link_grupo || '',
      link_briefing: item.link_briefing || '',
      link_criativo: item.link_criativo || '',
      link_site: item.link_site || '',
      link_campanha: item.link_campanha || '',
      numero_bm: item.numero_bm || '',
      comissao_paga: Boolean(item.comissao_paga),
      valor_comissao: Number(item.valor_comissao || 60),
      created_at: item.created_at || '',
      site_status: item.site_status || 'pendente',
      descricao_problema: item.descricao_problema || '',
      saque_solicitado: Boolean(item.saque_solicitado || false),
      comissao: item.comissao || 'Pendente',
      site_pago: Boolean(item.site_pago || false),
      cor_marcacao: item.cor_marcacao || null,
      // Novas propriedades do sistema avançado de comissões
      ultimo_pagamento_em: item.ultimo_pagamento_em || null,
      ultimo_valor_pago: item.ultimo_valor_pago || null,
      total_pago_comissao: Number(item.total_pago_comissao || 0),
      eh_ultimo_pago: ehUltimoPago // CORREÇÃO: Usar a variável formatada
    }
  } catch (error) {
    console.error('❌ [formatCliente] Erro ao formatar cliente:', error, item)
    return null
  }
}
