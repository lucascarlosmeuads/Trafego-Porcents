
import React, { useState, useEffect } from 'react'
import { useClienteData } from '@/hooks/useClienteData'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { ComissaoResumo } from './ComissaoResumo'
import { ComissaoConfig } from './ComissaoConfig'
import { VendasManager } from './VendasManager'

interface Venda {
  id: string
  valor_venda: number
  data_venda: string
  produto_vendido: string
  observacoes?: string
}

export function ComissaoMelhorada() {
  const { user } = useAuth()
  const { cliente, refreshData } = useClienteData(user?.email || '')
  const [vendas, setVendas] = useState<Venda[]>([])
  
  // Estado local para forçar re-render após salvar
  const [comissaoLocalConfirmada, setComissaoLocalConfirmada] = useState(false)

  // Verificar se comissão foi confirmada (usando estado local como fallback)
  const comissaoConfirmada = cliente?.comissao_confirmada || comissaoLocalConfirmada

  console.log('🔍 [ComissaoMelhorada] Estado atual:', {
    userEmail: user?.email,
    clienteComissaoConfirmada: cliente?.comissao_confirmada,
    comissaoLocalConfirmada,
    comissaoConfirmada,
    valorComissao: cliente?.valor_comissao
  })

  useEffect(() => {
    carregarVendas()
  }, [comissaoConfirmada])

  // Atualizar estado local quando dados do cliente mudarem
  useEffect(() => {
    if (cliente?.comissao_confirmada) {
      console.log('✅ [ComissaoMelhorada] Cliente confirmou comissão no banco, atualizando estado local')
      setComissaoLocalConfirmada(true)
    }
  }, [cliente?.comissao_confirmada])

  const carregarVendas = async () => {
    if (!user?.email) {
      console.warn('⚠️ [ComissaoMelhorada] Email do usuário não encontrado')
      return
    }
    
    try {
      console.log('🔍 [ComissaoMelhorada] Carregando vendas para:', user.email)
      
      const { data, error } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', user.email)
        .order('data_venda', { ascending: false })

      if (error) {
        console.error('❌ [ComissaoMelhorada] Erro ao carregar vendas:', error)
        throw error
      }
      
      console.log('✅ [ComissaoMelhorada] Vendas carregadas:', data?.length || 0)
      setVendas(data || [])
    } catch (error) {
      console.error('💥 [ComissaoMelhorada] Erro crítico ao carregar vendas:', error)
    }
  }

  const calcularTotalVendas = () => {
    return vendas.reduce((total, venda) => total + venda.valor_venda, 0)
  }

  const calcularComissaoDevida = () => {
    const totalVendas = calcularTotalVendas()
    const porcentagem = parseFloat(cliente?.valor_comissao?.toString() || '0')
    return (totalVendas * porcentagem) / 100
  }

  const handleConfirmarComissao = async (porcentagem: number) => {
    if (!user?.email) {
      console.error('❌ [ComissaoMelhorada] Email do usuário não encontrado')
      throw new Error('Email do usuário não encontrado. Faça login novamente.')
    }
    
    console.log('🚀 [ComissaoMelhorada] Iniciando confirmação de comissão:', {
      email: user.email,
      porcentagem
    })

    try {
      // 1. Primeiro, verificar se o cliente existe
      console.log('🔍 [ComissaoMelhorada] Verificando se cliente existe...')
      const { data: clienteExistente, error: erroVerificacao } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente, comissao_confirmada, valor_comissao')
        .eq('email_cliente', user.email)
        .single()

      if (erroVerificacao) {
        console.error('❌ [ComissaoMelhorada] Erro ao verificar cliente:', erroVerificacao)
        throw new Error(`Cliente não encontrado: ${erroVerificacao.message}`)
      }

      if (!clienteExistente) {
        console.error('❌ [ComissaoMelhorada] Cliente não existe na base de dados')
        throw new Error('Seu registro não foi encontrado na base de dados. Entre em contato com o suporte.')
      }

      console.log('✅ [ComissaoMelhorada] Cliente encontrado:', clienteExistente)

      // 2. Agora fazer o update
      console.log('📤 [ComissaoMelhorada] Atualizando comissão no banco...')
      const { data: dadosAtualizados, error: erroUpdate } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: porcentagem
        })
        .eq('email_cliente', user.email)
        .select('id, email_cliente, comissao_confirmada, valor_comissao')

      if (erroUpdate) {
        console.error('❌ [ComissaoMelhorada] Erro no update:', erroUpdate)
        throw new Error(`Erro ao salvar comissão: ${erroUpdate.message}`)
      }

      console.log('✅ [ComissaoMelhorada] Update executado, dados atualizados:', dadosAtualizados)

      if (!dadosAtualizados || dadosAtualizados.length === 0) {
        console.error('❌ [ComissaoMelhorada] Nenhum registro foi atualizado')
        throw new Error('Não foi possível atualizar sua comissão. Tente novamente.')
      }

      // 3. Verificar se realmente foi salvo
      console.log('🔍 [ComissaoMelhorada] Verificando se foi persistido...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Aguardar um segundo
      
      const { data: verificacao, error: erroVerificacaoFinal } = await supabase
        .from('todos_clientes')
        .select('comissao_confirmada, valor_comissao')
        .eq('email_cliente', user.email)
        .single()

      if (erroVerificacaoFinal) {
        console.error('❌ [ComissaoMelhorada] Erro na verificação final:', erroVerificacaoFinal)
        throw new Error('Erro ao verificar se a comissão foi salva.')
      }

      console.log('📊 [ComissaoMelhorada] Verificação final:', verificacao)

      if (!verificacao?.comissao_confirmada || verificacao.valor_comissao !== porcentagem) {
        console.error('❌ [ComissaoMelhorada] Comissão não foi persistida corretamente:', verificacao)
        throw new Error('A comissão não foi salva corretamente. Tente novamente.')
      }

      // 4. Atualizar estados locais
      console.log('🔄 [ComissaoMelhorada] Atualizando estados locais...')
      setComissaoLocalConfirmada(true)
      
      // 5. Recarregar dados do cliente
      console.log('🔄 [ComissaoMelhorada] Recarregando dados do cliente...')
      await refreshData()

      console.log('🎉 [ComissaoMelhorada] Comissão confirmada com sucesso!')

    } catch (error) {
      console.error('💥 [ComissaoMelhorada] Erro ao confirmar comissão:', error)
      // Resetar estado local em caso de erro
      setComissaoLocalConfirmada(false)
      throw error
    }
  }

  // Log para debug
  useEffect(() => {
    console.log('🔄 [ComissaoMelhorada] useEffect - comissaoConfirmada mudou:', comissaoConfirmada)
  }, [comissaoConfirmada])

  if (comissaoConfirmada) {
    const porcentagemAtual = cliente?.valor_comissao || 0
    const totalVendas = calcularTotalVendas()
    const comissaoDevida = calcularComissaoDevida()

    console.log('✅ [ComissaoMelhorada] Renderizando painel de vendas:', {
      porcentagemAtual,
      totalVendas,
      comissaoDevida
    })

    return (
      <div className="space-y-6">
        <ComissaoResumo 
          porcentagemAtual={porcentagemAtual}
          totalVendas={totalVendas}
          comissaoDevida={comissaoDevida}
        />
        
        <VendasManager porcentagemAtual={porcentagemAtual} />
      </div>
    )
  }

  console.log('⚙️ [ComissaoMelhorada] Renderizando painel de configuração')

  return (
    <div className="space-y-6">
      <ComissaoConfig 
        onConfirmarComissao={handleConfirmarComissao}
        valorComissaoAnterior={cliente?.valor_comissao}
      />
    </div>
  )
}
