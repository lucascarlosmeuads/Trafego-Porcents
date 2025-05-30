
import { createClient } from '@supabase/supabase-js'

// Usando os valores do arquivo de configuração do Supabase
const supabaseUrl = "https://rxpgqunqsegypssoqpyf.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cGdxdW5xc2VneXBzc29xcHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzEyODcsImV4cCI6MjA2MzE0NzI4N30.9ZzV-alsdI4EqrzRwFDxP9Vjr2l_KXHMPN9dVyf5ZWI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Cliente = {
  id: string
  data_venda: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  data_limite: string
  link_grupo: string
  link_briefing: string
  link_criativo: string
  link_site: string
  numero_bm: string
  comissao_paga: boolean
  valor_comissao: number
  created_at: string
  site_status: string
  descricao_problema: string
  saque_solicitado: boolean
  comissao: string
  site_pago: boolean
}

export type Gestor = {
  id: string
  user_id?: string
  nome: string
  email: string
  pode_adicionar_cliente: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}

export type SolicitacaoSaque = {
  id: string
  email_gestor: string
  nome_gestor: string
  cliente_id: number
  valor_comissao: number
  data_solicitacao: string
  status_saque: string
  processado_em: string | null
  created_at: string
  updated_at: string
}

// Status operacionais disponíveis - Status atualizados e organizados com os novos status
export const STATUS_CAMPANHA = [
  'Cliente Novo',
  'Preenchimento do Formulário',
  'Brief',
  'Criativo', 
  'Site',
  'Agendamento',
  'Configurando BM',
  'Subindo Campanha',
  'Otimização',
  'Problema',
  'Cliente Sumiu',
  'Reembolso',
  'Saque Pendente',
  'Campanha Anual',
  'Urgente',
  'Cliente Antigo'
] as const

export type StatusCampanha = typeof STATUS_CAMPANHA[number]

// Mapeamento para exibição visual - labels atualizados com os novos status
export const STATUS_DISPLAY_MAP: Record<StatusCampanha, string> = {
  'Cliente Novo': 'Cliente Novo',
  'Preenchimento do Formulário': 'Preenchimento do Formulário',
  'Brief': 'Brief',
  'Criativo': 'Criativo',
  'Site': 'Site',
  'Agendamento': 'Agendamento',
  'Configurando BM': 'Configurando BM',
  'Subindo Campanha': 'Subindo Campanha',
  'Otimização': 'Otimização',
  'Problema': 'Problema',
  'Cliente Sumiu': 'Cliente Sumiu',
  'Reembolso': 'Reembolso',
  'Saque Pendente': 'Campanha no Ar',  // ✅ Apenas mudança visual
  'Campanha Anual': 'Campanha Anual',
  'Urgente': 'Urgente',
  'Cliente Antigo': 'Cliente Antigo'
}

// Função para obter o rótulo visual do status
export const getStatusDisplayLabel = (status: StatusCampanha): string => {
  return STATUS_DISPLAY_MAP[status] || status
}
