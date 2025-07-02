
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface VendasDiaData {
  totalVendas: number
  valorTotalVendas: number
  comissaoTotal: number
  custoGestorTotal: number
  numeroVendas: number
  loading: boolean
  error: string | null
}

export function useVendasDia() {
  const [data, setData] = useState<VendasDiaData>({
    totalVendas: 0,
    valorTotalVendas: 0,
    comissaoTotal: 0,
    custoGestorTotal: 0,
    numeroVendas: 0,
    loading: true,
    error: null
  })

  const fetchVendasDia = async () => {
    try {
      console.log('🔄 [useVendasDia] Buscando dados de vendas do dia...')
      setData(prev => ({ ...prev, loading: true, error: null }))
      
      const hoje = new Date().toISOString().split('T')[0]
      
      // Buscar vendas da tabela vendas_cliente
      const { data: vendasCliente, error: errorVendasCliente } = await supabase
        .from('vendas_cliente')
        .select('valor_venda')
        .eq('data_venda', hoje)

      if (errorVendasCliente) {
        console.error('❌ [useVendasDia] Erro ao buscar vendas_cliente:', errorVendasCliente)
        throw errorVendasCliente
      }

      // Buscar vendas da tabela todos_clientes (com data_venda = hoje)
      const { data: vendasTodosClientes, error: errorTodosClientes } = await supabase
        .from('todos_clientes')
        .select('valor_venda_inicial, valor_comissao')
        .eq('data_venda', hoje)
        .not('valor_venda_inicial', 'is', null)

      if (errorTodosClientes) {
        console.error('❌ [useVendasDia] Erro ao buscar todos_clientes:', errorTodosClientes)
        throw errorTodosClientes
      }

      // Calcular totais reais
      let totalVendas = 0
      let numeroVendas = 0
      let comissaoTotal = 0
      let custoGestorTotal = 0

      // Vendas da tabela vendas_cliente
      if (vendasCliente && vendasCliente.length > 0) {
        const somaVendasCliente = vendasCliente.reduce((sum, venda) => sum + (venda.valor_venda || 0), 0)
        totalVendas += somaVendasCliente
        numeroVendas += vendasCliente.length
        
        // Para vendas_cliente, usar comissão padrão de R$ 60
        comissaoTotal += vendasCliente.length * 60
        custoGestorTotal += vendasCliente.length * 100
        
        console.log('💰 [useVendasDia] Vendas de vendas_cliente:', {
          valor: somaVendasCliente,
          quantidade: vendasCliente.length,
          comissao: vendasCliente.length * 60
        })
      }

      // Vendas da tabela todos_clientes
      if (vendasTodosClientes && vendasTodosClientes.length > 0) {
        const somaVendasTodos = vendasTodosClientes.reduce((sum, cliente) => sum + (cliente.valor_venda_inicial || 0), 0)
        const somaComissoes = vendasTodosClientes.reduce((sum, cliente) => sum + (cliente.valor_comissao || 60), 0)
        
        totalVendas += somaVendasTodos
        numeroVendas += vendasTodosClientes.length
        comissaoTotal += somaComissoes
        custoGestorTotal += vendasTodosClientes.length * 100
        
        console.log('💰 [useVendasDia] Vendas de todos_clientes:', {
          valor: somaVendasTodos,
          quantidade: vendasTodosClientes.length,
          comissao: somaComissoes
        })
      }

      console.log('📊 [useVendasDia] Totais calculados:', {
        totalVendas,
        numeroVendas,
        comissaoTotal,
        custoGestorTotal
      })

      setData({
        totalVendas,
        valorTotalVendas: totalVendas,
        comissaoTotal,
        custoGestorTotal,
        numeroVendas,
        loading: false,
        error: null
      })

    } catch (error: any) {
      console.error('❌ [useVendasDia] Erro ao buscar vendas:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao carregar dados de vendas'
      }))
    }
  }

  useEffect(() => {
    fetchVendasDia()
  }, [])

  return {
    data,
    refetch: fetchVendasDia
  }
}
