import { createClient } from '@supabase/supabase-js'

// Define types for Supabase data
export interface Cliente {
  id: number
  nome_cliente?: string
  email_cliente?: string
  telefone?: string
  vendedor?: string
  email_gestor?: string
  status_campanha?: string
  data_venda?: string
  data_limite?: string
  valor_comissao?: number
  comissao_paga?: boolean
  comissao?: string
  created_at: string
  link_campanha?: string
  link_criativo?: string
  link_briefing?: string
  link_grupo?: string
  link_site?: string
  numero_bm?: string
  data_subida_campanha?: string
  data_agendamento?: string
  status_envio?: string
  site_status?: string
  site_pago?: boolean
  descricao_problema?: string
  saque_solicitado?: boolean
  eh_ultimo_pago?: boolean
  total_pago_comissao?: number
  ultimo_pagamento_em?: string
  ultimo_valor_pago?: number
  created_at_br?: string
  valor_venda_inicial?: number
  data_cadastro_desejada?: string
  origem_cadastro?: string
}

export interface BriefingCliente {
  id: string
  email_cliente: string
  nome_produto: string
  descricao_resumida?: string
  publico_alvo?: string
  diferencial?: string
  nome_marca?: string
  tipo_prestacao_servico?: string
  localizacao_divulgacao?: string
  resumo_conversa_vendedor?: string
  observacoes_finais?: string
  comissao_aceita?: string
  forma_pagamento?: string
  investimento_diario?: number
  quer_site?: boolean
  liberar_edicao?: boolean
  created_at: string
  updated_at: string
}

export interface VendaCliente {
  id: string
  email_cliente: string
  produto_vendido: string
  valor_venda: number
  data_venda: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ArquivoCliente {
  id: string
  email_cliente: string
  nome_arquivo: string
  caminho_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo?: number
  created_at: string
  author_type: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)
