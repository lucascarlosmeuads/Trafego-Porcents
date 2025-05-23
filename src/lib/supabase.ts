
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
  nome_vendedor: string
  email_gestor_responsavel: string
  email_gestor?: string // Added for AdminDashboard
  status_campanha: string
  link_grupo: string
  link_reuniao_1: string
  link_reuniao_2: string
  link_reuniao_3: string
  bm_identificacao: string
  created_at: string
  comissao?: string // Added for AdminDashboard
}
