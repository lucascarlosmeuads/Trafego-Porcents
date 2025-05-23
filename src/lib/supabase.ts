
import { createClient } from '@supabase/supabase-js'

// For development only - in production these would come from environment variables
const FALLBACK_SUPABASE_URL = 'https://your-project-id.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'your-anon-key'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

// Check if we have the necessary values before creating client
if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.warn(
    'Missing Supabase URL. Please set VITE_SUPABASE_URL environment variable or connect with Supabase integration.'
  )
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn(
    'Missing Supabase Anon Key. Please set VITE_SUPABASE_ANON_KEY environment variable or connect with Supabase integration.'
  )
}

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
