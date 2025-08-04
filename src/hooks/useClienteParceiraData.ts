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

export interface ConsolidatedParceiraData {
  // Dados básicos
  id: string
  email_cliente: string
  nome_cliente: string | null
  telefone: string | null
  
  // Dados do formulário consolidados
  dados_completos: any
  tipo_negocio: string | null
  produto_descricao: string | null
  visao_futuro_texto: string | null
  audio_visao_futuro: string | null
  planejamento_estrategico: string | null
  valor_medio_produto: number | null
  ja_teve_vendas: boolean | null
  
  // Metadados
  cliente_pago: boolean
  status_negociacao: string
  vendedor_responsavel: string | null
  completo: boolean
  created_at: string
  updated_at: string
  
  // Indicadores de completude
  porcentagem_completude: number
  tem_dados_estruturados: boolean
}

export function useClienteParceiraData(emailCliente: string) {
  const [dadosConsolidados, setDadosConsolidados] = useState<ConsolidatedParceiraData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const consolidarDados = (clienteData: ClienteParceiraData | null, formularioData: FormularioParceiraData | null): ConsolidatedParceiraData | null => {
    if (!clienteData && !formularioData) return null

    // Priorizar dados do formulário, usar cliente como fallback
    const dadosFormulario = formularioData?.respostas || clienteData?.dados_formulario || {}
    
    // Verificar se tem dados estruturados (mais de nome e telefone)
    const camposEstruturados = ['produto_descricao', 'visao_futuro_texto', 'publico_alvo', 'diferencial']
    const temDadosEstruturados = camposEstruturados.some(campo => 
      formularioData?.[campo as keyof FormularioParceiraData] || dadosFormulario[campo]
    )

    // Calcular completude baseado em campos importantes
    const camposImportantes = [
      'nome', 'telefone', 'produto_descricao', 'publico_alvo', 
      'diferencial', 'visao_futuro_texto', 'tipo_negocio'
    ]
    const camposPreenchidos = camposImportantes.filter(campo => {
      const valorFormulario = formularioData?.[campo as keyof FormularioParceiraData]
      const valorDados = dadosFormulario[campo]
      const valorCliente = campo === 'nome' ? clienteData?.nome_cliente : 
                          campo === 'telefone' ? clienteData?.telefone : null
      
      return valorFormulario || valorDados || valorCliente
    }).length
    
    const porcentagemCompletude = Math.round((camposPreenchidos / camposImportantes.length) * 100)

    return {
      id: clienteData?.id || formularioData?.id || '',
      email_cliente: clienteData?.email_cliente || formularioData?.email_usuario || emailCliente,
      nome_cliente: clienteData?.nome_cliente || dadosFormulario.nome || null,
      telefone: clienteData?.telefone || dadosFormulario.telefone || null,
      
      dados_completos: dadosFormulario,
      tipo_negocio: formularioData?.tipo_negocio || dadosFormulario.tipo_negocio || null,
      produto_descricao: formularioData?.produto_descricao || dadosFormulario.produto_descricao || null,
      visao_futuro_texto: formularioData?.visao_futuro_texto || dadosFormulario.visao_futuro_texto || null,
      audio_visao_futuro: formularioData?.audio_visao_futuro || dadosFormulario.audio_visao_futuro || null,
      planejamento_estrategico: formularioData?.planejamento_estrategico || dadosFormulario.planejamento_estrategico || null,
      valor_medio_produto: formularioData?.valor_medio_produto || dadosFormulario.valor_medio_produto || null,
      ja_teve_vendas: formularioData?.ja_teve_vendas || dadosFormulario.ja_teve_vendas || null,
      
      cliente_pago: formularioData?.cliente_pago || false,
      status_negociacao: formularioData?.status_negociacao || 'pendente',
      vendedor_responsavel: formularioData?.vendedor_responsavel || null,
      completo: formularioData?.completo || false,
      created_at: clienteData?.created_at || formularioData?.created_at || new Date().toISOString(),
      updated_at: clienteData?.updated_at || formularioData?.updated_at || new Date().toISOString(),
      
      porcentagem_completude: porcentagemCompletude,
      tem_dados_estruturados: temDadosEstruturados
    }
  }

  const fetchClienteParceiraData = async () => {
    if (!emailCliente) {
      console.warn('⚠️ [useClienteParceiraData] Email cliente não fornecido')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🔍 [useClienteParceiraData] === INICIANDO BUSCA CONSOLIDADA ===')
      console.log('📧 [useClienteParceiraData] Email:', emailCliente)

      // Buscar ambos os dados simultaneamente
      const [clienteResult, formularioResult] = await Promise.all([
        supabase
          .from('clientes_parceria')
          .select('*')
          .eq('email_cliente', emailCliente.trim())
          .maybeSingle(),
        supabase
          .from('formularios_parceria')
          .select('*')
          .eq('email_usuario', emailCliente.trim())
          .maybeSingle()
      ])

      if (clienteResult.error) {
        console.error('❌ [useClienteParceiraData] Erro cliente parceria:', clienteResult.error)
      }

      if (formularioResult.error) {
        console.error('❌ [useClienteParceiraData] Erro formulário:', formularioResult.error)
      }

      // Consolidar dados
      const dadosConsolidados = consolidarDados(clienteResult.data, formularioResult.data)
      
      if (dadosConsolidados) {
        console.log('✅ [useClienteParceiraData] Dados consolidados:', {
          nome: dadosConsolidados.nome_cliente,
          completude: dadosConsolidados.porcentagem_completude + '%',
          estruturado: dadosConsolidados.tem_dados_estruturados ? 'SIM' : 'NÃO',
          campos_principais: {
            produto: !!dadosConsolidados.produto_descricao,
            visao: !!dadosConsolidados.visao_futuro_texto,
            audio: !!dadosConsolidados.audio_visao_futuro
          }
        })
        setDadosConsolidados(dadosConsolidados)
      } else {
        console.warn('⚠️ [useClienteParceiraData] Nenhum dado encontrado para consolidação')
      }

      console.log('✅ [useClienteParceiraData] === BUSCA CONSOLIDADA CONCLUÍDA ===')

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
    dadosConsolidados,
    loading,
    error,
    refreshData,
    // Manter compatibilidade com código existente
    clienteParceria: dadosConsolidados ? {
      id: dadosConsolidados.id,
      email_cliente: dadosConsolidados.email_cliente,
      nome_cliente: dadosConsolidados.nome_cliente,
      telefone: dadosConsolidados.telefone,
      dados_formulario: dadosConsolidados.dados_completos,
      created_at: dadosConsolidados.created_at,
      updated_at: dadosConsolidados.updated_at,
      lead_id: null,
      ativo: true
    } as ClienteParceiraData : null,
    formularioParceria: dadosConsolidados ? {
      id: dadosConsolidados.id,
      email_usuario: dadosConsolidados.email_cliente,
      respostas: dadosConsolidados.dados_completos,
      completo: dadosConsolidados.completo,
      tipo_negocio: dadosConsolidados.tipo_negocio || '',
      produto_descricao: dadosConsolidados.produto_descricao,
      visao_futuro_texto: dadosConsolidados.visao_futuro_texto,
      audio_visao_futuro: dadosConsolidados.audio_visao_futuro,
      planejamento_estrategico: dadosConsolidados.planejamento_estrategico,
      valor_medio_produto: dadosConsolidados.valor_medio_produto,
      ja_teve_vendas: dadosConsolidados.ja_teve_vendas,
      cliente_pago: dadosConsolidados.cliente_pago,
      status_negociacao: dadosConsolidados.status_negociacao,
      vendedor_responsavel: dadosConsolidados.vendedor_responsavel,
      created_at: dadosConsolidados.created_at,
      updated_at: dadosConsolidados.updated_at
    } as FormularioParceiraData : null
  }
}