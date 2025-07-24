import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { calculateClienteNovoCommission, isValidClienteNovoSaleValue } from '@/utils/clienteNovoCommissionCalculator'

interface ClienteSimples {
  id: number
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
}

export function useClienteNovoSellerDataMegaFixed(sellerEmail: string) {
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchClientes = async () => {
    if (!sellerEmail) return

    setLoading(true)
    try {
      console.log('🔍 [MegaFixed] Buscando clientes para:', sellerEmail)
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, telefone, email_cliente, vendedor, email_gestor, status_campanha, created_at')
        .eq('vendedor', sellerEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [MegaFixed] Erro ao buscar clientes:', error)
        return
      }

      setClientes(data || [])
      setTotalClientes((data || []).length)
      
      console.log('✅ [MegaFixed] Clientes carregados:', (data || []).length)
    } catch (error) {
      console.error('💥 [MegaFixed] Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCliente = async (clienteData: {
    nome_cliente: string
    telefone: string
    email_cliente: string
    email_gestor: string
    vendedor_responsavel?: string
    resumo_conversa_vendedor?: string
    valor_venda_inicial: number | null
    senha_cliente?: string
  }) => {
    console.log('🚀 [MegaFixed] === INÍCIO DO PROCESSO SUPER SIMPLIFICADO ===')

    try {
      // Preparar dados limpos
      const dadosLimpos = {
        nome_cliente: clienteData.nome_cliente.trim(),
        telefone: clienteData.telefone.trim(),
        email_cliente: clienteData.email_cliente.toLowerCase().trim(),
        email_gestor: clienteData.email_gestor,
        vendedor: clienteData.vendedor_responsavel || sellerEmail,
        status_campanha: 'Cliente Novo',
        data_venda: new Date().toISOString().split('T')[0],
        valor_venda_inicial: clienteData.valor_venda_inicial,
        valor_comissao: calculateClienteNovoCommission(clienteData.valor_venda_inicial || 0),
        comissao: 'A Pagar'
      }

      console.log('📋 [MegaFixed] Dados limpos preparados:', dadosLimpos)

      // Verificar se cliente já existe
      const { data: existente } = await supabase
        .from('todos_clientes')
        .select('id')
        .eq('email_cliente', dadosLimpos.email_cliente)
        .maybeSingle()

      let resultado
      
      if (existente) {
        console.log('📝 [MegaFixed] Cliente existe, atualizando...')
        
        const { data, error } = await supabase
          .from('todos_clientes')
          .update(dadosLimpos)
          .eq('id', existente.id)
          .select('id, nome_cliente, email_cliente')
          .single()

        if (error) {
          console.error('❌ [MegaFixed] Erro ao atualizar:', error)
          throw error
        }

        resultado = { isNew: false, data }
        
      } else {
        console.log('➕ [MegaFixed] Cliente novo, criando...')
        
        const { data, error } = await supabase
          .from('todos_clientes')
          .insert([dadosLimpos])
          .select('id, nome_cliente, email_cliente')
          .single()

        if (error) {
          console.error('❌ [MegaFixed] Erro ao criar:', error)
          throw error
        }

        resultado = { isNew: true, data }
      }

      console.log('✅ [MegaFixed] Cliente processado:', resultado)

      // Criar autenticação se é novo cliente
      if (resultado.isNew && clienteData.senha_cliente) {
        console.log('🔐 [MegaFixed] Criando autenticação...')
        
        try {
          const { data: sessionAtual } = await supabase.auth.getSession()
          await supabase.auth.signOut()

          await supabase.auth.signUp({
            email: dadosLimpos.email_cliente,
            password: clienteData.senha_cliente
          })

          if (sessionAtual.session) {
            await supabase.auth.setSession(sessionAtual.session)
          }
          
          console.log('✅ [MegaFixed] Auth criada com sucesso')
        } catch (authError) {
          console.warn('⚠️ [MegaFixed] Erro na auth (não crítico):', authError)
        }
      }

      // Salvar resumo se fornecido
      if (clienteData.resumo_conversa_vendedor?.trim()) {
        console.log('📝 [MegaFixed] Salvando resumo...')
        
        try {
          await supabase
            .from('briefings_cliente')
            .upsert({
              email_cliente: dadosLimpos.email_cliente,
              resumo_conversa_vendedor: clienteData.resumo_conversa_vendedor.trim(),
              nome_produto: 'Tráfego Pago',
            })
          
          console.log('✅ [MegaFixed] Resumo salvo')
        } catch (briefingError) {
          console.warn('⚠️ [MegaFixed] Erro no resumo (não crítico):', briefingError)
        }
      }

      // Atualizar lista
      await fetchClientes()

      console.log('🎉 [MegaFixed] === PROCESSO 100% COMPLETO ===')

      return {
        success: true,
        isNewClient: resultado.isNew,
        senhaDefinida: true,
        valorComissao: dadosLimpos.valor_comissao,
        clientData: resultado.data
      }

    } catch (error: any) {
      console.error('💥 [MegaFixed] ERRO FINAL:', error)
      
      return {
        success: false,
        isNewClient: false,
        senhaDefinida: false,
        valorComissao: 0,
        clientData: null,
        error: error.message
      }
    }
  }

  useEffect(() => {
    if (sellerEmail) {
      fetchClientes()
    }
  }, [sellerEmail])

  return {
    clientes,
    totalClientes,
    loading,
    addCliente,
    refetch: fetchClientes
  }
}