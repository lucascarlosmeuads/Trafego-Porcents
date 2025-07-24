import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { calculateClienteNovoCommission, isValidClienteNovoSaleValue } from '@/utils/clienteNovoCommissionCalculator'
import { SENHA_PADRAO_CLIENTE } from '@/utils/clienteValidation'

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

export function useClienteNovoSellerData(sellerEmail: string) {
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchClientes = async () => {
    if (!sellerEmail) return

    setLoading(true)
    try {
      console.log('🔍 [useClienteNovoSellerData] Buscando clientes para:', sellerEmail)
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, telefone, email_cliente, vendedor, email_gestor, status_campanha, created_at')
        .eq('vendedor', sellerEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useClienteNovoSellerData] Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de clientes",
          variant: "destructive"
        })
        return
      }

      const clientesFormatados = (data || []).map(cliente => ({
        ...cliente,
        created_at: cliente.created_at
      }))

      setClientes(clientesFormatados)
      setTotalClientes(clientesFormatados.length)
      
      console.log('✅ [useClienteNovoSellerData] Clientes carregados:', clientesFormatados.length)
    } catch (error) {
      console.error('💥 [useClienteNovoSellerData] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar clientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addCliente = async (clienteData: {
    nome_cliente: string
    telefone: string
    email_cliente: string
    email_gestor: string
    resumo_conversa_vendedor?: string
    valor_venda_inicial: number | null
    valor_comissao?: number | null
    senha_cliente?: string
  }) => {
    console.log('🆕 [useClienteNovoSellerData] === INICIANDO ADIÇÃO DE CLIENTE ===')
    console.log('🆕 [useClienteNovoSellerData] Dados recebidos:', clienteData)

    try {
      const emailNormalizado = clienteData.email_cliente.toLowerCase().trim()
      const vendedorNome = sellerEmail

      // Verificar se valor de venda é válido para Cliente Novo
      if (!clienteData.valor_venda_inicial || !isValidClienteNovoSaleValue(clienteData.valor_venda_inicial)) {
        toast({
          title: "Erro",
          description: "Selecione um valor de venda válido (R$ 350 ou R$ 500)",
          variant: "destructive"
        })
        return {
          success: false,
          isNewClient: false,
          senhaDefinida: false,
          comissaoCalculadaAutomaticamente: false,
          valorComissao: 0,
          clientData: null
        }
      }

      // Calcular comissão automaticamente (valores fixos)
      const comissaoCalculada = calculateClienteNovoCommission(clienteData.valor_venda_inicial)
      
      console.log('🧮 [useClienteNovoSellerData] Comissão calculada automaticamente:', comissaoCalculada)

      // Verificar se cliente já existe
      const { data: clienteExistente, error: errorClienteExistente } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente')
        .ilike('email_cliente', emailNormalizado)
        .single()

      let isNewClient = false
      let clienteId: string | number
      
      if (errorClienteExistente && errorClienteExistente.code === 'PGRST116') {
        // Cliente não existe, criar novo
        console.log('➕ [useClienteNovoSellerData] Cliente não existe, criando novo...')
        isNewClient = true

        const novoClienteData = {
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_cliente: emailNormalizado,
          email_gestor: clienteData.email_gestor,
          vendedor: vendedorNome,
          status_campanha: 'Cliente Novo',
          produto_nicho: 'Tráfego Pago',
          data_venda: new Date().toISOString().split('T')[0],
          valor_venda_inicial: clienteData.valor_venda_inicial,
          valor_comissao: comissaoCalculada,
          comissao: comissaoCalculada > 0 ? 'A Pagar' : 'Pendente'
        }

        const { data: novoCliente, error: errorInserir } = await supabase
          .from('todos_clientes')
          .insert([novoClienteData])
          .select('id, email_cliente, nome_cliente')
          .single()

        if (errorInserir) {
          console.error('❌ [useClienteNovoSellerData] Erro ao inserir cliente:', errorInserir)
          toast({
            title: "Erro",
            description: "Erro ao criar cliente na base de dados",
            variant: "destructive"
          })
          return {
            success: false,
            isNewClient: false,
            senhaDefinida: false,
            comissaoCalculadaAutomaticamente: false,
            valorComissao: 0,
            clientData: null
          }
        }

        clienteId = novoCliente.id
        console.log('✅ [useClienteNovoSellerData] Cliente criado com ID:', clienteId)

        // Criar usuário de autenticação
        console.log('🔐 [useClienteNovoSellerData] Criando usuário de autenticação...')
        
        const senhaCliente = clienteData.senha_cliente || SENHA_PADRAO_CLIENTE
        
        // Fazer logout temporário para criar conta do cliente
        const { data: sessionAtual } = await supabase.auth.getSession()
        await supabase.auth.signOut()

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailNormalizado,
          password: senhaCliente,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        })

        if (authError) {
          console.error('❌ [useClienteNovoSellerData] Erro auth:', authError)
          // Restaurar sessão do vendedor
          if (sessionAtual.session) {
            await supabase.auth.setSession(sessionAtual.session)
          }
        } else {
          console.log('✅ [useClienteNovoSellerData] Usuário auth criado')
          // Fazer logout da conta do cliente e restaurar sessão do vendedor
          await supabase.auth.signOut()
          if (sessionAtual.session) {
            await supabase.auth.setSession(sessionAtual.session)
          }
        }

      } else if (clienteExistente) {
        // Cliente já existe, atualizar dados
        console.log('📝 [useClienteNovoSellerData] Cliente já existe, atualizando...')
        isNewClient = false
        clienteId = clienteExistente.id

        const updateData = {
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_gestor: clienteData.email_gestor,
          vendedor: vendedorNome,
          valor_venda_inicial: clienteData.valor_venda_inicial,
          valor_comissao: comissaoCalculada,
          comissao: comissaoCalculada > 0 ? 'A Pagar' : 'Pendente'
        }

        const { error: errorAtualizar } = await supabase
          .from('todos_clientes')
          .update(updateData)
          .eq('id', clienteId)

        if (errorAtualizar) {
          console.error('❌ [useClienteNovoSellerData] Erro ao atualizar cliente:', errorAtualizar)
          return {
            success: false,
            isNewClient: false,
            senhaDefinida: false,
            comissaoCalculadaAutomaticamente: false,
            valorComissao: 0,
            clientData: null
          }
        }
      } else {
        throw new Error('Erro inesperado ao verificar cliente')
      }

      // Salvar resumo da conversa se fornecido
      if (clienteData.resumo_conversa_vendedor?.trim()) {
        console.log('📝 [useClienteNovoSellerData] Salvando resumo da conversa...')
        
        const { error: briefingError } = await supabase
          .from('briefings_cliente')
          .upsert({
            email_cliente: emailNormalizado,
            resumo_conversa_vendedor: clienteData.resumo_conversa_vendedor.trim(),
            nome_produto: 'Tráfego Pago',
          }, {
            onConflict: 'email_cliente'
          })

        if (briefingError) {
          console.error('❌ [useClienteNovoSellerData] Erro ao salvar resumo:', briefingError)
        }
      }

      // Refetch dos dados
      await fetchClientes()

      console.log('🎉 [useClienteNovoSellerData] Cliente processado com sucesso!')

      return {
        success: true,
        isNewClient,
        senhaDefinida: true,
        comissaoCalculadaAutomaticamente: true,
        valorComissao: comissaoCalculada,
        clientData: {
          id: clienteId,
          email_cliente: emailNormalizado,
          nome_cliente: clienteData.nome_cliente
        }
      }

    } catch (error: any) {
      console.error('💥 [useClienteNovoSellerData] Erro crítico:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado ao processar cliente",
        variant: "destructive"
      })
      
      return {
        success: false,
        isNewClient: false,
        senhaDefinida: false,
        comissaoCalculadaAutomaticamente: false,
        valorComissao: 0,
        clientData: null
      }
    }
  }

  const refetch = async () => {
    await fetchClientes()
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
    refetch
  }
}