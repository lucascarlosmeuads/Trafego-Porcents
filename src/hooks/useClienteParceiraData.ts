import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ClienteParceiraData {
  id: string
  email_cliente: string
  nome_cliente: string | null
  telefone: string | null
  dados_formulario: any
  created_at: string
  updated_at: string
  lead_id: string | null
  ativo: boolean
}

export interface FormularioParceiraData {
  id: string
  email_usuario: string
  respostas: any
  completo: boolean
  tipo_negocio: string
  produto_descricao: string | null
  visao_futuro_texto: string | null
  audio_visao_futuro: string | null
  planejamento_estrategico: string | null
  valor_medio_produto: number | null
  ja_teve_vendas: boolean | null
  cliente_pago: boolean
  status_negociacao: string
  vendedor_responsavel: string | null
  created_at: string
  updated_at: string
}

export function useClienteParceiraData(emailCliente: string) {
  const [clienteParceria, setClienteParceria] = useState<ClienteParceiraData | null>(null)
  const [formularioParceria, setFormularioParceria] = useState<FormularioParceiraData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClienteParceiraData = async () => {
    if (!emailCliente) {
      console.warn('⚠️ [useClienteParceiraData] Email cliente não fornecido')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [useClienteParceiraData] === INICIANDO BUSCA DE DADOS PARCERIA ===')
      console.log('📧 [useClienteParceiraData] Email:', emailCliente)

      // Buscar dados do cliente parceria
      console.log('👤 [useClienteParceiraData] Buscando cliente parceria...')
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes_parceria')
        .select('*')
        .eq('email_cliente', emailCliente.trim())
        .maybeSingle()

      if (clienteError) {
        console.error('❌ [useClienteParceiraData] Erro ao buscar cliente parceria:', clienteError)
        setError(clienteError.message)
        return
      }

      if (clienteData) {
        console.log('✅ [useClienteParceiraData] Cliente parceria encontrado:', {
          id: clienteData.id,
          nome: clienteData.nome_cliente,
          lead_id: clienteData.lead_id
        })
        setClienteParceria(clienteData)
      } else {
        console.warn('⚠️ [useClienteParceiraData] Nenhum cliente parceria encontrado')
      }

      // Buscar formulário de parceria
      console.log('📋 [useClienteParceiraData] Buscando formulário parceria...')
      const { data: formularioData, error: formularioError } = await supabase
        .from('formularios_parceria')
        .select('*')
        .eq('email_usuario', emailCliente.trim())
        .maybeSingle()

      if (formularioError) {
        console.error('❌ [useClienteParceiraData] Erro ao buscar formulário:', formularioError)
      } else {
        console.log('📋 [useClienteParceiraData] Formulário encontrado:', formularioData ? 'SIM' : 'NÃO')
        if (formularioData) {
          console.log('📋 [useClienteParceiraData] Dados do formulário:', {
            completo: formularioData.completo,
            tipo_negocio: formularioData.tipo_negocio,
            cliente_pago: formularioData.cliente_pago,
            tem_audio: !!formularioData.audio_visao_futuro
          })
        }
        setFormularioParceria(formularioData)
      }

      console.log('✅ [useClienteParceiraData] === BUSCA CONCLUÍDA ===')

    } catch (error: any) {
      console.error('💥 [useClienteParceiraData] Erro crítico:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 [useClienteParceiraData] useEffect disparado, email:', emailCliente)
    fetchClienteParceiraData()
  }, [emailCliente])

  const refreshData = async () => {
    console.log('🔄 [useClienteParceiraData] === REFRESH INICIADO ===')
    await fetchClienteParceiraData()
    console.log('✅ [useClienteParceiraData] === REFRESH CONCLUÍDO ===')
  }

  return {
    clienteParceria,
    formularioParceria,
    loading,
    error,
    refreshData
  }
}