
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { calculateCommission, isValidSaleValue } from '@/utils/commissionCalculator'

interface ClienteSimples {
  id: string
  nome_cliente: string
  telefone: string
  email_cliente: string
  vendedor: string
  email_gestor: string
  status_campanha: string
  created_at: string
}

// Senha padrão para novos clientes
const SENHA_PADRAO_CLIENTE = 'parceriadesucesso'

export function useSimpleSellerData(sellerEmail: string) {
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchClientes = async () => {
    if (!sellerEmail) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Extrair nome do vendedor do email
      const emailPrefix = sellerEmail.split('@')[0]
      let sellerName = emailPrefix.replace('vendedor', '')
      
      // Casos específicos para os três vendedores
      if (emailPrefix.includes('itamar')) sellerName = 'Itamar'
      if (emailPrefix.includes('edu')) sellerName = 'Edu'
      if (emailPrefix.includes('joao')) sellerName = 'João'
      
      console.log('🔍 Buscando clientes para vendedor:', sellerName)

      // Buscar clientes do vendedor
      const { data, error } = await supabase
        .from('todos_clientes')
        .select(`
          id,
          nome_cliente,
          telefone,
          email_cliente,
          vendedor,
          email_gestor,
          status_campanha,
          created_at
        `)
        .ilike('vendedor', `%${sellerName}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes",
          variant: "destructive"
        })
        return
      }

      const clientesFormatados = (data || []).map(item => ({
        id: String(item.id),
        nome_cliente: item.nome_cliente || '',
        telefone: item.telefone || '',
        email_cliente: item.email_cliente || '',
        vendedor: item.vendedor || '',
        email_gestor: item.email_gestor || '',
        status_campanha: item.status_campanha || 'Brief',
        created_at: item.created_at || ''
      }))

      setClientes(clientesFormatados)
      setTotalClientes(clientesFormatados.length)
      
      console.log(`✅ ${clientesFormatados.length} clientes encontrados`)

    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado",
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
    status_campanha: string
    data_venda: string
    senha_cliente?: string
    valor_venda_inicial?: number | null
    valor_comissao?: number | null
  }) => {
    try {
      console.log('🔵 [useSimpleSellerData] === INICIANDO CRIAÇÃO DE CLIENTE ===')
      console.log('📧 [useSimpleSellerData] Email do cliente:', clienteData.email_cliente)
      
      // ⚡ SALVAR SESSÃO ATUAL DO VENDEDOR ANTES DE CRIAR CLIENTE
      const { data: currentSession } = await supabase.auth.getSession()
      const vendorSession = currentSession.session
      console.log('💾 [useSimpleSellerData] Sessão do vendedor salva:', vendorSession?.user?.email)
      
      // Normalizar email para comparação case-insensitive
      const normalizedEmail = clienteData.email_cliente.toLowerCase().trim()
      
      // Preparar nome do vendedor
      const emailPrefix = sellerEmail.split('@')[0]
      let vendorName = emailPrefix.replace('vendedor', '')
      
      if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
      if (emailPrefix.includes('edu')) vendorName = 'Edu'
      if (emailPrefix.includes('joao')) vendorName = 'João'

      // Usar senha customizada ou padrão
      const senhaParaUsar = clienteData.senha_cliente || SENHA_PADRAO_CLIENTE

      // Calcular comissão automaticamente se valor da venda foi fornecido
      let valorComissao = 60.00 // Valor padrão
      let comissaoCalculadaAutomaticamente = false

      if (clienteData.valor_comissao) {
        // Se uma comissão foi definida manualmente, usar ela
        valorComissao = clienteData.valor_comissao
        console.log(`⚙️ [useSimpleSellerData] Comissão manual definida: R$ ${valorComissao}`)
      } else if (isValidSaleValue(clienteData.valor_venda_inicial)) {
        // Se não há comissão manual mas há valor de venda válido, calcular automaticamente
        valorComissao = calculateCommission(clienteData.valor_venda_inicial)
        comissaoCalculadaAutomaticamente = true
        console.log(`🧮 [useSimpleSellerData] Comissão calculada automaticamente: R$ ${valorComissao} (baseada em venda de R$ ${clienteData.valor_venda_inicial})`)
      } else {
        console.log(`📋 [useSimpleSellerData] Sem valor de venda válido. Usando comissão padrão: R$ ${valorComissao}`)
      }

      // Step 1: Verificar se cliente já existe na tabela (CASE-INSENSITIVE)
      console.log('🔍 [useSimpleSellerData] Verificando se cliente já existe na tabela...')
      const { data: existingClient, error: checkError } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente, nome_cliente')
        .ilike('email_cliente', normalizedEmail)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [useSimpleSellerData] Erro ao verificar cliente existente:', checkError)
        throw new Error(`Erro ao verificar cliente: ${checkError.message}`)
      }

      let clienteJaExistia = false
      let clientId: string | number

      if (existingClient) {
        console.log('⚠️ [useSimpleSellerData] Cliente já existe, fazendo update dos dados...')
        clienteJaExistia = true
        clientId = existingClient.id
        
        const { error: updateError } = await supabase
          .from('todos_clientes')
          .update({
            nome_cliente: clienteData.nome_cliente,
            telefone: clienteData.telefone,
            email_gestor: clienteData.email_gestor,
            vendedor: vendorName,
            status_campanha: clienteData.status_campanha,
            data_venda: clienteData.data_venda,
            valor_comissao: valorComissao,
            valor_venda_inicial: clienteData.valor_venda_inicial || null
          })
          .eq('id', existingClient.id)

        if (updateError) {
          console.error('❌ [useSimpleSellerData] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        console.log('✅ [useSimpleSellerData] Cliente existente atualizado com sucesso')
      } else {
        // Step 2: Cliente novo - inserir na tabela primeiro
        console.log('📋 [useSimpleSellerData] Inserindo cliente na tabela todos_clientes...')
        
        const novoCliente = {
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_cliente: normalizedEmail,
          email_gestor: clienteData.email_gestor,
          vendedor: vendorName,
          status_campanha: clienteData.status_campanha,
          data_venda: clienteData.data_venda,
          valor_comissao: valorComissao,
          valor_venda_inicial: clienteData.valor_venda_inicial || null,
          comissao_paga: false,
          site_status: 'pendente'
        }

        const { data: insertData, error: insertError } = await supabase
          .from('todos_clientes')
          .insert([novoCliente])
          .select()
          .single()

        if (insertError) {
          console.error('❌ [useSimpleSellerData] Erro ao inserir na tabela:', insertError)
          throw new Error(`Erro ao adicionar cliente: ${insertError.message}`)
        }

        console.log('✅ [useSimpleSellerData] Cliente inserido na tabela com sucesso!')
        clientId = insertData.id
      }

      // Step 3: CRIAR CONTA NO SUPABASE AUTH SEM INTERFERIR NA SESSÃO ATUAL
      let senhaDefinida = false
      if (!clienteJaExistia) {
        console.log('🔐 [useSimpleSellerData] Criando conta no Supabase Auth...')
        
        try {
          // ⚡ IMPORTANTE: Fazer logout temporário para evitar interferência na sessão
          console.log('🔄 [useSimpleSellerData] Fazendo logout temporário...')
          await supabase.auth.signOut()
          
          // Criar conta usando signUp com a senha informada e email normalizado
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: senhaParaUsar,
            options: {
              data: {
                full_name: clienteData.nome_cliente,
                role: 'cliente'
              }
            }
          })

          if (authError) {
            console.error('⚠️ [useSimpleSellerData] Erro ao criar conta Auth:', authError)
            // Não bloquear se a conta já existir
            if (!authError.message.includes('already registered') && !authError.message.includes('User already registered')) {
              console.error('❌ [useSimpleSellerData] Erro crítico na criação da conta:', authError)
            }
          } else {
            console.log('✅ [useSimpleSellerData] Conta criada com sucesso!')
            senhaDefinida = true
          }

          // ⚡ RESTAURAR SESSÃO DO VENDEDOR IMEDIATAMENTE
          if (vendorSession) {
            console.log('🔄 [useSimpleSellerData] Restaurando sessão do vendedor...')
            await supabase.auth.setSession(vendorSession)
            console.log('✅ [useSimpleSellerData] Sessão do vendedor restaurada:', vendorSession.user?.email)
          }
          
        } catch (authErr) {
          console.error('⚠️ [useSimpleSellerData] Erro na criação da conta (catch):', authErr)
          
          // ⚡ GARANTIR QUE A SESSÃO DO VENDEDOR SEJA RESTAURADA MESMO EM CASO DE ERRO
          if (vendorSession) {
            console.log('🔄 [useSimpleSellerData] Restaurando sessão do vendedor após erro...')
            try {
              await supabase.auth.setSession(vendorSession)
              console.log('✅ [useSimpleSellerData] Sessão do vendedor restaurada após erro')
            } catch (restoreError) {
              console.error('❌ [useSimpleSellerData] Erro ao restaurar sessão:', restoreError)
            }
          }
        }
      }

      // Recarregar lista
      await fetchClientes()
      
      // Mostrar mensagem de sucesso
      if (!clienteJaExistia) {
        let successMessage = `Cliente ${clienteData.nome_cliente} foi adicionado.`
        
        if (comissaoCalculadaAutomaticamente) {
          successMessage += `\n🧮 Comissão: R$ ${valorComissao} (calculada automaticamente)`
        }
        
        if (senhaDefinida) {
          successMessage += `\n🔐 Senha: ${senhaParaUsar}`
        }

        toast({
          title: "✅ Cliente cadastrado com sucesso!",
          description: successMessage,
          duration: 6000
        })
      } else {
        toast({
          title: "Sucesso",
          description: "Dados do cliente atualizados com sucesso!"
        })
      }
      
      console.log('🎉 [useSimpleSellerData] Processo concluído com sucesso')
      
      // Retornar estrutura IDÊNTICA ao useClienteOperations
      return { 
        success: true, 
        isNewClient: !clienteJaExistia,
        senhaDefinida,
        comissaoCalculadaAutomaticamente,
        valorComissao,
        clientData: {
          id: clientId,
          email_cliente: normalizedEmail,
          nome_cliente: clienteData.nome_cliente
        }
      }

    } catch (error) {
      console.error('💥 [useSimpleSellerData] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado ao criar cliente",
        variant: "destructive"
      })
      return { success: false, isNewClient: false, senhaDefinida: false, clientData: null }
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [sellerEmail])

  return {
    clientes,
    totalClientes,
    loading,
    addCliente,
    refetch: fetchClientes
  }
}
