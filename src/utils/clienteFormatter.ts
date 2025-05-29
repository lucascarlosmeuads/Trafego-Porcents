

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
      numero_bm: item.numero_bm || '',
      comissao_paga: Boolean(item.comissao_paga),
      valor_comissao: Number(item.valor_comissao || 60),
      created_at: item.created_at || '',
      site_status: item.site_status || 'pendente',
      descricao_problema: item.descricao_problema || '',
      saque_solicitado: Boolean(item.saque_solicitado || false),
      comissao: item.comissao || 'Pendente'
    }
  } catch (error) {
    console.error('❌ [formatCliente] Erro ao formatar cliente:', error, item)
    return null
  }
}

