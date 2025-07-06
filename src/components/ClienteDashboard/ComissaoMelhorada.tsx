
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

  const verificarComissaoPersistida = async (porcentagem: number) => {
    if (!user?.email) {
      throw new Error('Email do usuário não encontrado')
    }

    console.log('🔍 [ComissaoMelhorada] Verificando se comissão foi persistida...')
    
    // Aguardar um pouco para garantir que a transação foi commitada
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data, error } = await supabase
      .from('todos_clientes')
      .select('comissao_confirmada, valor_comissao')
      .eq('email_cliente', user.email)
      .single()

    if (error) {
      console.error('❌ [ComissaoMelhorada] Erro ao verificar persistência:', error)
      throw error
    }

    console.log('📊 [ComissaoMelhorada] Dados verificados:', data)

    if (!data.comissao_confirmada) {
      throw new Error('Comissão não foi salva no banco de dados')
    }

    if (data.valor_comissao !== porcentagem) {
      throw new Error(`Porcentagem salva (${data.valor_comissao}%) não confere com a enviada (${porcentagem}%)`)
    }

    console.log('✅ [ComissaoMelhorada] Comissão verificada e persistida com sucesso!')
    return true
  }

  const handleConfirmarComissao = async (porcentagem: number) => {
    if (!user?.email) {
      console.error('❌ [ComissaoMelhorada] Email do usuário não encontrado')
      throw new Error('Usuário não autenticado')
    }
    
    console.log('🚀 [ComissaoMelhorada] Iniciando confirmação de comissão:', {
      email: user.email,
      porcentagem
    })

    try {
      // 1. Tentar salvar no banco
      console.log('📤 [ComissaoMelhorada] Salvando no banco de dados...')
      const { error, data } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: porcentagem
        })
        .eq('email_cliente', user.email)
        .select()

      if (error) {
        console.error('❌ [ComissaoMelhorada] Erro na operação de update:', error)
        throw new Error(`Erro ao salvar: ${error.message}`)
      }

      console.log('✅ [ComissaoMelhorada] Update executado, dados retornados:', data)

      if (!data || data.length === 0) {
        console.error('❌ [ComissaoMelhorada] Nenhum registro foi atualizado')
        throw new Error('Nenhum cliente foi encontrado para atualizar')
      }

      // 2. Verificar se realmente foi salvo
      await verificarComissaoPersistida(porcentagem)

      // 3. Atualizar estados locais
      console.log('🔄 [ComissaoMelhorada] Atualizando estados locais...')
      setComissaoLocalConfirmada(true)
      
      // 4. Recarregar dados do cliente
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
