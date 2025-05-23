
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
