
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

  useEffect(() => {
    carregarVendas()
  }, [comissaoConfirmada])

  // Atualizar estado local quando dados do cliente mudarem
  useEffect(() => {
    if (cliente?.comissao_confirmada) {
      setComissaoLocalConfirmada(true)
    }
  }, [cliente?.comissao_confirmada])

  const carregarVendas = async () => {
    if (!user?.email) return
    
    try {
      const { data, error } = await supabase
        .from('vendas_cliente')
        .select('*')
        .eq('email_cliente', user.email)
        .order('data_venda', { ascending: false })

      if (error) throw error
      setVendas(data || [])
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
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
    if (!user?.email) return
    
    const { error } = await supabase
      .from('todos_clientes')
      .update({ 
        comissao_confirmada: true,
        valor_comissao: porcentagem // Salvamos apenas a porcentagem configurada
      })
      .eq('email_cliente', user.email)

    if (error) throw error

    // CORREÇÃO MELHORADA: Forçar atualização local E recarregar dados
    setComissaoLocalConfirmada(true)
    await refreshData()
  }

  if (comissaoConfirmada) {
    const porcentagemAtual = cliente?.valor_comissao || 0
    const totalVendas = calcularTotalVendas()
    const comissaoDevida = calcularComissaoDevida()

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

  return (
    <div className="space-y-6">
      <ComissaoConfig 
        onConfirmarComissao={handleConfirmarComissao}
        valorComissaoAnterior={cliente?.valor_comissao}
      />
    </div>
  )
}
