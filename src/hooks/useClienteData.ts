import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface ArquivoCliente {
  id: string
  nome_arquivo: string
  caminho_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number
  created_at: string
  author_type: 'cliente' | 'gestor'
}

export interface BriefingData {
  nome_produto: string
  descricao_resumida: string
  publico_alvo: string
  diferencial: string
  investimento_diario: number
  comissao_aceita: string
  observacoes_finais: string
  created_at: string
  updated_at: string
}

// Add the missing type exports with id property
export interface BriefingCliente extends BriefingData {
  id: string
  liberar_edicao?: boolean
}

export interface Cliente {
  id: string
  nome_cliente: string
  email_cliente: string
  telefone?: string
  data_venda?: string
  vendedor?: string
  email_gestor?: string
  status_campanha?: string
  data_limite?: string
  link_grupo?: string
  link_briefing?: string
  link_criativo?: string
  link_site?: string
  numero_bm?: string
  comissao_paga?: boolean
  valor_comissao?: number
  site_status?: string
  saque_solicitado?: boolean
  descricao_problema?: string
  data_subida_campanha?: string
}

export interface VendaCliente {
  id: string
  produto_vendido: string
  valor_venda: number
  data_venda: string
  observacoes: string
  created_at: string
}

export function useClienteData(emailCliente: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [briefing, setBriefing] = useState<BriefingCliente | null>(null)
  const [vendas, setVendas] = useState<VendaCliente[]>([])
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchClienteData = async () => {
      if (!emailCliente) return

      setLoading(true)
      try {
        // Buscar dados do cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from('todos_clientes')
          .select('*')
          .eq('email_cliente', emailCliente)
          .single()

        if (clienteError) {
          console.error('Erro ao buscar cliente:', clienteError)
        } else {
          setCliente(clienteData)
        }

        // Buscar briefing do cliente
        const { data: briefingData, error: briefingError } = await supabase
          .from('briefings_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .single()

        if (briefingError && briefingError.code !== 'PGRST116') {
          console.error('Erro ao buscar briefing:', briefingError)
        } else {
          setBriefing(briefingData)
        }

        // Buscar vendas do cliente
        const { data: vendasData, error: vendasError } = await supabase
          .from('vendas_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .order('data_venda', { ascending: false })

        if (vendasError) {
          console.error('Erro ao buscar vendas:', vendasError)
        } else {
          setVendas(vendasData || [])
        }

        // Buscar arquivos do cliente
        const { data: arquivosData, error: arquivosError } = await supabase
          .from('arquivos_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .order('created_at', { ascending: false })

        if (arquivosError) {
          console.error('Erro ao buscar arquivos:', arquivosError)
        } else {
          setArquivos(arquivosData || [])
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do cliente",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClienteData()
  }, [emailCliente, toast])

  const refetch = () => {
    if (emailCliente) {
      fetchClienteData()
    }
  }

  const fetchClienteData = async () => {
    if (!emailCliente) return

    setLoading(true)
    try {
      // Buscar dados do cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      if (clienteError) {
        console.error('Erro ao buscar cliente:', clienteError)
      } else {
        setCliente(clienteData)
      }

      // Buscar briefing do cliente
      const { data: briefingData, error: briefingError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      if (briefingError && briefingError.code !== 'PGRST116') {
        console.error('Erro ao buscar briefing:', briefingError)
      } else {
        setBriefing(briefingData)
      }

      // Buscar vendas do cliente
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('data_venda', { ascending: false })

      if (vendasError) {
        console.error('Erro ao buscar vendas:', vendasError)
      } else {
        setVendas(vendasData || [])
      }

      // Buscar arquivos do cliente
      const { data: arquivosData, error: arquivosError } = await supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('created_at', { ascending: false })

      if (arquivosError) {
        console.error('Erro ao buscar arquivos:', arquivosError)
      } else {
        setArquivos(arquivosData || [])
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    cliente,
    briefing,
    vendas,
    arquivos,
    loading,
    refetch
  }
}
