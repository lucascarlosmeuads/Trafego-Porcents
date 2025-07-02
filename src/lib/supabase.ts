
import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/integrations/supabase/types'

const supabaseUrl = 'https://rxpgqunqsegypssqpyf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cGdxdW5xc2VneXBzc29xcHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzEyODcsImV4cCI6MjA2MzE0NzI4N30.9ZzV-alsdI4EqrzRwFDxP9Vjr2l_KXHMPN9dVyf5ZWI'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export database types
export type Cliente = Database['public']['Tables']['todos_clientes']['Row']
export type StatusCampanha = 
  | 'Cliente Novo'
  | 'Preenchimento do Formulário'
  | 'Brief'
  | 'Criativo'
  | 'Site'
  | 'Agendamento'
  | 'Configurando BM'
  | 'Subindo Campanha'
  | 'Otimização'
  | 'Problema'
  | 'Cliente Sumiu'
  | 'Reembolso'
  | 'Campanha no Ar'
  | 'Campanha Anual'
  | 'Urgente'
  | 'Cliente Antigo'
  | 'Cancelado'
  | 'Cancelamento'
  | 'Inativo'
  | 'Off'
  | 'Pausado'
  | 'Parado'
  | 'Finalizado'
  | 'Encerrado'
  | 'Saque Pendente'

export const STATUS_CAMPANHA: StatusCampanha[] = [
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
  'Campanha no Ar',
  'Campanha Anual',
  'Urgente',
  'Cliente Antigo',
  'Cancelado',
  'Cancelamento',
  'Inativo',
  'Off',
  'Pausado',
  'Parado',
  'Finalizado',
  'Encerrado',
  'Saque Pendente'
]

export type Gestor = Database['public']['Tables']['gestores']['Row']
export type SacCliente = Database['public']['Tables']['sac_clientes']['Row']
export type ArquivoCliente = Database['public']['Tables']['arquivos_cliente']['Row']
export type BriefingCliente = Database['public']['Tables']['briefings_cliente']['Row']
export type ChatMensagem = Database['public']['Tables']['chat_mensagens']['Row']
export type VendasCliente = Database['public']['Tables']['vendas_cliente']['Row']
export type ClienteProfile = Database['public']['Tables']['cliente_profiles']['Row']
export type SugestaoMelhoria = Database['public']['Tables']['sugestoes_melhorias']['Row']
export type ComissaoHistorico = Database['public']['Tables']['historico_pagamentos_comissao']['Row']
