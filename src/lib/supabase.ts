
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Cliente = {
  id: string
  data_venda: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  comissao: string
  email_gestor: string
  status_envio: string
  data_limite: string
  status_campanha: string
  data_subida_campanha: string
  link_grupo: string
  link_briefing: string
  link_criativo: string
  link_site: string
  data_agendamento: string
  numero_bm: string
  created_at: string
}
