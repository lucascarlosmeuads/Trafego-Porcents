
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BriefingCliente {
  id: string
  email_cliente: string
  nome_produto: string
  nome_marca?: string | null
  publico_alvo?: string | null
  descricao_resumida?: string | null
  diferencial?: string | null
  investimento_diario?: number | null
  comissao_aceita?: string | null
  observacoes_finais?: string | null
  liberar_edicao?: boolean | null
  quer_site?: boolean | null
  // Novos campos da etapa 2
  direcionamento_campanha?: string | null
  abrangencia_atendimento?: string | null
  forma_pagamento?: string | null
  possui_facebook?: boolean | null
  possui_instagram?: boolean | null
  utiliza_whatsapp_business?: boolean | null
  // Novos campos da etapa 3
  criativos_prontos?: boolean | null
  videos_prontos?: boolean | null
  cores_desejadas?: string | null
  tipo_fonte?: string | null
  cores_proibidas?: string | null
  fonte_especifica?: string | null
  estilo_visual?: string | null
  tipos_imagens_preferidas?: string[] | null
  // Controle de etapas
  etapa_atual?: number | null
  formulario_completo?: boolean | null
  created_at: string
  updated_at: string
}

export interface ClienteData {
  id: number
  nome_cliente: string | null
  email_cliente: string | null
  telefone: string | null
  vendedor: string | null
  email_gestor: string | null
  status_campanha: string | null
  data_venda: string | null
  data_limite: string | null
  valor_comissao: number | null
  comissao: string | null
  site_status: string | null
  site_pago: boolean | null
  descricao_problema: string | null
  link_briefing: string | null
  link_criativo: string | null
  link_site: string | null
  link_campanha: string | null
  numero_bm: string | null
  created_at: string
  comissao_confirmada?: boolean | null
  site_descricao_personalizada?: string | null
  data_subida_campanha?: string | null
}

export interface VendaCliente {
  id: string
  email_cliente: string
  data_venda: string
  produto_vendido: string
  valor_venda: number
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export interface ArquivoCliente {
  id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number
  caminho_arquivo: string
  email_cliente: string
  author_type: string
  created_at: string
  url_arquivo: string
  data_upload: string
}

// Exportar tipos individuais para compatibilidade
export type Cliente = ClienteData

export function useClienteData(emailCliente: string) {
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [briefing, setBriefing] = useState<BriefingCliente | null>(null)
  const [vendas, setVendas] = useState<VendaCliente[]>([])
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClienteData = async () => {
    if (!emailCliente) {
      console.warn('⚠️ [useClienteData] Email cliente não fornecido')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [useClienteData] === INICIANDO BUSCA DE DADOS ===')
      console.log('📧 [useClienteData] Email:', emailCliente)

      // Buscar dados do cliente com mais detalhes de log
      console.log('👤 [useClienteData] Buscando dados do cliente...')
      const { data: clientesData, error: clientesError } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', emailCliente.trim())
        .maybeSingle()

      if (clientesError) {
        console.error('❌ [useClienteData] Erro ao buscar cliente:', clientesError)
        setError(clientesError.message)
        return
      }

      if (clientesData) {
        console.log('✅ [useClienteData] Cliente encontrado:', {
          id: clientesData.id,
          nome: clientesData.nome_cliente,
          comissao_confirmada: clientesData.comissao_confirmada,
          valor_comissao: clientesData.valor_comissao
        })
      } else {
        console.warn('⚠️ [useClienteData] Nenhum cliente encontrado')
      }

      setCliente(clientesData)

      // Buscar briefing
      console.log('📋 [useClienteData] Buscando briefing...')
      const { data: briefingData, error: briefingError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .eq('email_cliente', emailCliente.trim())
        .maybeSingle()

      if (briefingError) {
        console.error('❌ [useClienteData] Erro ao buscar briefing:', briefingError)
      } else {
        console.log('📋 [useClienteData] Briefing encontrado:', briefingData ? 'SIM' : 'NÃO')
        setBriefing(briefingData)
      }

      // Buscar vendas
      console.log('💰 [useClienteData] Buscando vendas...')
      const { data: vendasData, error: vendasError } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', emailCliente.trim())
        .order('data_venda', { ascending: false })

      if (vendasError) {
        console.error('❌ [useClienteData] Erro ao buscar vendas:', vendasError)
      } else {
        console.log('💰 [useClienteData] Vendas encontradas:', vendasData?.length || 0)
        setVendas(vendasData || [])
      }

      // Buscar arquivos
      console.log('📁 [useClienteData] Buscando arquivos...')
      const { data: arquivosData, error: arquivosError } = await supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('email_cliente', emailCliente.trim())
        .order('created_at', { ascending: false })

      if (arquivosError) {
        console.error('❌ [useClienteData] Erro ao buscar arquivos:', arquivosError)
      } else {
        console.log('📁 [useClienteData] Arquivos encontrados:', arquivosData?.length || 0)
        setArquivos(arquivosData || [])
      }

      console.log('✅ [useClienteData] === BUSCA CONCLUÍDA ===')

    } catch (error: any) {
      console.error('💥 [useClienteData] Erro crítico:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 [useClienteData] useEffect disparado, email:', emailCliente)
    fetchClienteData()
  }, [emailCliente])

  const refreshData = async () => {
    console.log('🔄 [useClienteData] === REFRESH INICIADO ===')
    await fetchClienteData()
    console.log('✅ [useClienteData] === REFRESH CONCLUÍDO ===')
  }

  // Alias para compatibilidade
  const refetch = refreshData

  return {
    cliente,
    briefing,
    vendas,
    arquivos,
    loading,
    error,
    refreshData,
    refetch
  }
}
