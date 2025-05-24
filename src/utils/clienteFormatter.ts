
import { type Cliente } from '@/lib/supabase'

export const formatCliente = (item: any): Cliente | null => {
  if (!item.id || item.id === null || item.id === undefined) {
    console.error('⚠️ [clienteFormatter] Registro sem ID encontrado:', item)
    return null
  }
  
  return {
    id: String(item.id),
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
    comissao_paga: item.comissao_paga || false,
    valor_comissao: item.valor_comissao || 60.00,
    created_at: item.created_at || '',
    site_status: item.site_status || 'pendente'
  }
}

export const validateSecurityForNonAdmin = (data: any[], userEmail: string, isAdmin: boolean): boolean => {
  if (!isAdmin && data && data.length > 0) {
    const registrosInvalidos = data.filter(item => item.email_gestor !== userEmail)
    if (registrosInvalidos.length > 0) {
      console.error('🚨 [clienteFormatter] ERRO DE SEGURANÇA: Registros com email_gestor incorreto detectados!', registrosInvalidos)
      return false
    }
  }
  return true
}
