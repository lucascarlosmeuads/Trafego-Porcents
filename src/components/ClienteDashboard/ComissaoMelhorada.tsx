
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
      // 1. Buscar o cliente para obter o ID
      console.log('🔍 [ComissaoMelhorada] Buscando cliente por email...')
      const { data: clienteData, error: erroConsulta } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente, nome_cliente, comissao_confirmada, valor_comissao')
        .eq('email_cliente', user.email)
        .single()

      if (erroConsulta || !clienteData) {
        console.error('❌ [ComissaoMelhorada] Cliente não encontrado:', erroConsulta)
        throw new Error(`Cliente não encontrado. Erro: ${erroConsulta?.message || 'Dados não localizados'}`)
      }

      console.log('✅ [ComissaoMelhorada] Cliente encontrado:', {
        id: clienteData.id,
        nome: clienteData.nome_cliente,
        email: clienteData.email_cliente,
        comissaoAtual: clienteData.comissao_confirmada,
        valorAtual: clienteData.valor_comissao
      })

      // 2. Fazer o update usando o ID do cliente
      console.log('📤 [ComissaoMelhorada] Executando update da comissão...')
      const { data: dadosAtualizados, error: erroUpdate } = await supabase
        .from('todos_clientes')
        .update({ 
          comissao_confirmada: true,
          valor_comissao: porcentagem
        })
        .eq('id', clienteData.id)
        .select('id, email_cliente, nome_cliente, comissao_confirmada, valor_comissao')

      if (erroUpdate) {
        console.error('❌ [ComissaoMelhorada] Erro no update:', erroUpdate)
        throw new Error(`Erro ao atualizar comissão: ${erroUpdate.message}`)
      }

      console.log('📊 [ComissaoMelhorada] Resultado do update:', dadosAtualizados)

      if (!dadosAtualizados || dadosAtualizados.length === 0) {
        console.error('❌ [ComissaoMelhorada] Update não retornou dados')
        throw new Error('A atualização foi executada mas não retornou confirmação.')
      }

      const clienteAtualizado = dadosAtualizados[0]

      // 3. Verificar se a atualização foi realmente aplicada
      if (!clienteAtualizado.comissao_confirmada || clienteAtualizado.valor_comissao !== porcentagem) {
        console.error('❌ [ComissaoMelhorada] Valores não foram atualizados corretamente:', {
          comissaoConfirmada: clienteAtualizado.comissao_confirmada,
          valorComissao: clienteAtualizado.valor_comissao,
          valorEsperado: porcentagem
        })
        throw new Error('Os dados não foram salvos corretamente no banco de dados.')
      }

      // 4. Aguardar um pouco e fazer verificação final
      console.log('⏳ [ComissaoMelhorada] Aguardando para verificação final...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: verificacaoFinal, error: erroVerificacao } = await supabase
        .from('todos_clientes')
        .select('comissao_confirmada, valor_comissao')
        .eq('id', clienteData.id)
        .single()

      if (erroVerificacao || !verificacaoFinal) {
        console.error('❌ [ComissaoMelhorada] Erro na verificação final:', erroVerificacao)
        throw new Error('Erro ao verificar se os dados foram salvos.')
      }

      if (!verificacaoFinal.comissao_confirmada || verificacaoFinal.valor_comissao !== porcentagem) {
        console.error('❌ [ComissaoMelhorada] Verificação final falhou:', verificacaoFinal)
        throw new Error('Os dados não foram persistidos corretamente. Tente novamente.')
      }

      // 5. Sucesso! Atualizar estados locais
      console.log('🎉 [ComissaoMelhorada] Comissão confirmada com sucesso!')
      setComissaoLocalConfirmada(true)
      
      // 6. Recarregar dados do cliente
      console.log('🔄 [ComissaoMelhorada] Recarregando dados do cliente...')
      await refreshData()

      console.log('✅ [ComissaoMelhorada] Processo completo finalizado com sucesso!')

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
