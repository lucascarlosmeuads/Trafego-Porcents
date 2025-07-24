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

export function useClienteNovoSellerDataFixed(sellerEmail: string) {
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchClientes = async () => {
    if (!sellerEmail) return

    setLoading(true)
    try {
      console.log('🔍 [useClienteNovoSellerDataFixed] Buscando clientes para:', sellerEmail)
      
      const { data, error } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente, telefone, email_cliente, vendedor, email_gestor, status_campanha, created_at')
        .eq('vendedor', sellerEmail)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useClienteNovoSellerDataFixed] Erro ao buscar clientes:', error)
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
      
      console.log('✅ [useClienteNovoSellerDataFixed] Clientes carregados:', clientesFormatados.length)
    } catch (error) {
      console.error('💥 [useClienteNovoSellerDataFixed] Erro inesperado:', error)
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
    vendedor_responsavel?: string
    resumo_conversa_vendedor?: string
    valor_venda_inicial: number | null
    valor_comissao?: number | null
    senha_cliente?: string
  }) => {
    console.log('🆕 [useClienteNovoSellerDataFixed] === INICIANDO CRIAÇÃO SIMPLIFICADA ===')
    console.log('🆕 [useClienteNovoSellerDataFixed] Dados recebidos:', clienteData)

    try {
      // ETAPA 1: Validações iniciais
      const emailNormalizado = clienteData.email_cliente.toLowerCase().trim()
      const vendedorNome = clienteData.vendedor_responsavel || sellerEmail

      console.log('🔍 [useClienteNovoSellerDataFixed] Email normalizado:', emailNormalizado)
      console.log('🔍 [useClienteNovoSellerDataFixed] Vendedor:', vendedorNome)

      // Verificar se valor de venda é válido para Cliente Novo
      if (!clienteData.valor_venda_inicial || !isValidClienteNovoSaleValue(clienteData.valor_venda_inicial)) {
        console.error('❌ [useClienteNovoSellerDataFixed] Valor de venda inválido:', clienteData.valor_venda_inicial)
        toast({
          title: "Erro",
          description: "Selecione um valor de venda válido (R$ 350 ou R$ 500)",
          variant: "destructive"
        })
        return { success: false, isNewClient: false, senhaDefinida: false, valorComissao: 0, clientData: null }
      }

      // ETAPA 2: Calcular comissão (valores fixos)
      const comissaoCalculada = calculateClienteNovoCommission(clienteData.valor_venda_inicial)
      console.log('🧮 [useClienteNovoSellerDataFixed] Comissão calculada:', comissaoCalculada)

      // ETAPA 3: Verificar se cliente já existe
      console.log('🔍 [useClienteNovoSellerDataFixed] Verificando se cliente existe...')
      const { data: clienteExistente, error: errorClienteExistente } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente, nome_cliente')
        .ilike('email_cliente', emailNormalizado)
        .maybeSingle()

      if (errorClienteExistente) {
        console.error('❌ [useClienteNovoSellerDataFixed] Erro ao verificar cliente:', errorClienteExistente)
        toast({
          title: "Erro",
          description: `Erro ao verificar cliente: ${errorClienteExistente.message}`,
          variant: "destructive"
        })
        return { success: false, isNewClient: false, senhaDefinida: false, valorComissao: 0, clientData: null }
      }

      let isNewClient = !clienteExistente
      let clienteId: string | number

      if (clienteExistente) {
        console.log('📝 [useClienteNovoSellerDataFixed] Cliente já existe, atualizando:', clienteExistente.id)
        clienteId = clienteExistente.id

        // ETAPA 4A: Atualizar cliente existente  
        const updateData = {
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_gestor: clienteData.email_gestor,
          vendedor: vendedorNome,
          valor_venda_inicial: clienteData.valor_venda_inicial,
          valor_comissao: comissaoCalculada,
          comissao: comissaoCalculada > 0 ? 'A Pagar' : 'Pendente',
          status_campanha: 'Cliente Novo'
        }

        console.log('📝 [useClienteNovoSellerDataFixed] Dados para atualização:', updateData)

        const { error: errorAtualizar } = await supabase
          .from('todos_clientes')
          .update(updateData)
          .eq('id', clienteId)

        if (errorAtualizar) {
          console.error('❌ [useClienteNovoSellerDataFixed] Erro ao atualizar cliente:', errorAtualizar)
          toast({
            title: "Erro",
            description: `Erro ao atualizar cliente: ${errorAtualizar.message}`,
            variant: "destructive"
          })
          return { success: false, isNewClient: false, senhaDefinida: false, valorComissao: 0, clientData: null }
        }

        console.log('✅ [useClienteNovoSellerDataFixed] Cliente atualizado com sucesso!')

      } else {
        console.log('➕ [useClienteNovoSellerDataFixed] Cliente não existe, criando novo...')

        // ETAPA 4B: Criar novo cliente
        const novoClienteData = {
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_cliente: emailNormalizado,
          email_gestor: clienteData.email_gestor,
          vendedor: vendedorNome,
          status_campanha: 'Cliente Novo',
          data_venda: new Date().toISOString().split('T')[0],
          valor_venda_inicial: clienteData.valor_venda_inicial,
          valor_comissao: comissaoCalculada,
          comissao: comissaoCalculada > 0 ? 'A Pagar' : 'Pendente'
        }

        console.log('➕ [useClienteNovoSellerDataFixed] Dados para inserção:', novoClienteData)

        const { data: novoCliente, error: errorInserir } = await supabase
          .from('todos_clientes')
          .insert([novoClienteData])
          .select('id, email_cliente, nome_cliente')
          .single()

        if (errorInserir) {
          console.error('❌ [useClienteNovoSellerDataFixed] Erro ao inserir cliente:', errorInserir)
          toast({
            title: "Erro de Inserção",
            description: `Erro detalhado: ${errorInserir.message}. Code: ${errorInserir.code}`,
            variant: "destructive"
          })
          return { success: false, isNewClient: false, senhaDefinida: false, valorComissao: 0, clientData: null }
        }

        clienteId = novoCliente.id
        console.log('✅ [useClienteNovoSellerDataFixed] Cliente criado com ID:', clienteId)

        // ETAPA 5: Criar usuário de autenticação (simplificado)
        console.log('🔐 [useClienteNovoSellerDataFixed] Criando usuário de autenticação...')
        
        try {
          const senhaCliente = clienteData.senha_cliente || SENHA_PADRAO_CLIENTE
          
          // Guardar sessão atual
          const { data: sessionAtual } = await supabase.auth.getSession()
          
          // Fazer logout temporário para criar conta do cliente
          await supabase.auth.signOut()

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailNormalizado,
            password: senhaCliente,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                role: 'cliente'
              }
            }
          })

          // Restaurar sessão independente do resultado da criação
          if (sessionAtual.session) {
            await supabase.auth.setSession(sessionAtual.session)
          }

          if (authError) {
            console.error('⚠️ [useClienteNovoSellerDataFixed] Erro auth (não crítico):', authError)
            // Não falhar o processo todo por causa da auth
          } else {
            console.log('✅ [useClienteNovoSellerDataFixed] Usuário auth criado:', authData.user?.email)
          }

        } catch (authError) {
          console.error('⚠️ [useClienteNovoSellerDataFixed] Erro na autenticação (não crítico):', authError)
        }
      }

      // ETAPA 6: Salvar resumo da conversa se fornecido
      if (clienteData.resumo_conversa_vendedor?.trim()) {
        console.log('📝 [useClienteNovoSellerDataFixed] Salvando resumo da conversa...')
        
        try {
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
            console.error('❌ [useClienteNovoSellerDataFixed] Erro ao salvar resumo:', briefingError)
          } else {
            console.log('✅ [useClienteNovoSellerDataFixed] Resumo salvo com sucesso')
          }
        } catch (briefingError) {
          console.error('⚠️ [useClienteNovoSellerDataFixed] Erro no briefing (não crítico):', briefingError)
        }
      }

      // ETAPA 7: Refetch dos dados para sincronizar
      console.log('🔄 [useClienteNovoSellerDataFixed] Atualizando lista de clientes...')
      await fetchClientes()

      console.log('🎉 [useClienteNovoSellerDataFixed] === PROCESSO COMPLETO COM SUCESSO ===')

      // Mostrar toast de sucesso
      toast({
        title: "✅ Cliente criado com sucesso!",
        description: `${clienteData.nome_cliente} foi ${isNewClient ? 'criado' : 'atualizado'} no sistema. Comissão: R$ ${comissaoCalculada}`,
        duration: 5000
      })

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
      console.error('💥 [useClienteNovoSellerDataFixed] ERRO CRÍTICO:', error)
      
      // Toast com erro detalhado
      toast({
        title: "Erro Crítico",
        description: `Falha na criação do cliente: ${error.message}. Verifique os logs para mais detalhes.`,
        variant: "destructive",
        duration: 10000
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