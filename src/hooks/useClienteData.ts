import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Cliente {
  id: number
  email_cliente: string
  nome_cliente: string
  status_campanha: string
  data_venda: string
  data_subida_campanha: string
  vendedor: string
  comissao: string
  comissao_paga: boolean
  status_envio: string
  email_gestor: string
  data_limite: string
  link_grupo: string
  link_briefing: string
  link_criativo: string
  link_site: string
  data_agendamento: string
  numero_bm: string
  telefone: string
  site_status: string
  descricao_problema: string
  valor_comissao: number
  saque_solicitado: boolean
  created_at: string
}

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
  author_type: string
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
      console.log('🔍 [useClienteData] Buscando dados para email:', emailCliente)

      // Buscar dados do cliente na tabela principal
      const { data: clienteData, error: clienteError } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      if (clienteError && clienteError.code !== 'PGRST116') {
        console.error('❌ [useClienteData] Erro ao buscar cliente:', clienteError)
      }

      if (!clienteData) {
        console.warn('⚠️ [useClienteData] Cliente não encontrado na tabela todos_clientes:', emailCliente)
        console.warn('⚠️ [useClienteData] Isso pode indicar que o registro foi deletado ou nunca existiu')
        
        // Create a default cliente object for users not in todos_clientes
        const defaultCliente: Cliente = {
          id: 0,
          email_cliente: emailCliente,
          nome_cliente: 'Cliente',
          status_campanha: 'Preenchimento do Formulário',
          data_venda: '',
          data_subida_campanha: '',
          vendedor: '',
          comissao: '',
          comissao_paga: false,
          status_envio: '',
          email_gestor: '',
          data_limite: '',
          link_grupo: '',
          link_briefing: '',
          link_criativo: '',
          link_site: '',
          data_agendamento: '',
          numero_bm: '',
          telefone: '',
          site_status: 'pendente',
          descricao_problema: '',
          valor_comissao: 60,
          saque_solicitado: false,
          created_at: new Date().toISOString()
        }
        setCliente(defaultCliente)
      } else {
        console.log('✅ [useClienteData] Cliente encontrado:', clienteData.nome_cliente)
        setCliente(clienteData)
      }

      // Buscar briefing do cliente
      const { data: briefingData, error: briefingError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .single()

      if (briefingError && briefingError.code !== 'PGRST116') {
        console.error('❌ [useClienteData] Erro ao buscar briefing:', briefingError)
      }

      setBriefing(briefingData || null)

      // Buscar vendas do cliente
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('data_venda', { ascending: false })

      if (vendasError) {
        console.error('❌ [useClienteData] Erro ao buscar vendas:', vendasError)
      }

      setVendas(vendasData || [])

      // Buscar arquivos do cliente
      const { data: arquivosData, error: arquivosError } = await supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('created_at', { ascending: false })

      if (arquivosError) {
        console.error('❌ [useClienteData] Erro ao buscar arquivos:', arquivosError)
      }

      setArquivos(arquivosData || [])

    } catch (error) {
      console.error('💥 [useClienteData] Erro crítico ao carregar dados do cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    console.log('🔄 [useClienteData] Refazendo busca de dados para:', emailCliente)
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
