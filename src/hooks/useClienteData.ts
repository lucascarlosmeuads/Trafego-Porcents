
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cliente } from '@/lib/supabase'

export interface BriefingCliente {
  id: string
  email_cliente: string
  nome_produto: string
  descricao_resumida: string | null
  publico_alvo: string | null
  diferencial: string | null
  investimento_diario: number | null
  comissao_aceita: string | null
  observacoes_finais: string | null
  liberar_edicao: boolean | null
  created_at: string
  updated_at: string
}

export interface VendaCliente {
  id: string
  email_cliente: string
  produto_vendido: string
  valor_venda: number
  data_venda: string
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface ArquivoCliente {
  id: string
  email_cliente: string
  nome_arquivo: string
  caminho_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number | null
  created_at: string
}

export function useClienteData(emailCliente: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [briefing, setBriefing] = useState<BriefingCliente | null>(null)
  const [vendas, setVendas] = useState<VendaCliente[]>([])
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClienteData = async () => {
    if (!emailCliente) return

    try {
      setLoading(true)

      // Buscar dados do cliente na tabela principal
      const { data: clienteData } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      setCliente(clienteData)

      // Buscar briefing do cliente
      const { data: briefingData } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      setBriefing(briefingData)

      // Buscar vendas do cliente
      const { data: vendasData } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('data_venda', { ascending: false })

      setVendas(vendasData || [])

      // Buscar arquivos do cliente
      const { data: arquivosData } = await supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('created_at', { ascending: false })

      setArquivos(arquivosData || [])

    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchClienteData()
  }

  useEffect(() => {
    fetchClienteData()
  }, [emailCliente])

  return {
    cliente,
    briefing,
    vendas,
    arquivos,
    loading,
    refetch
  }
}
