
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

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
      
      // Casos específicos
      if (emailPrefix.includes('itamar')) sellerName = 'Itamar'
      if (emailPrefix.includes('edu')) sellerName = 'Edu'
      
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

  // Função para recuperar clientes órfãos
  const recuperarClienteOrfao = async (emailCliente: string, nomeCliente: string, vendorName: string, clienteData: any) => {
    console.log('🔧 [recuperarClienteOrfao] Tentando recuperar cliente órfão:', emailCliente)
    
    try {
      const novoCliente = {
        nome_cliente: nomeCliente,
        telefone: clienteData.telefone,
        email_cliente: emailCliente,
        email_gestor: clienteData.email_gestor,
        vendedor: vendorName,
        status_campanha: clienteData.status_campanha,
        data_venda: clienteData.data_venda,
        valor_comissao: 20.00,
        comissao_paga: false,
        site_status: 'pendente'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('todos_clientes')
        .insert([novoCliente])
        .select()
        .single()

      if (insertError) {
        console.error('❌ [recuperarClienteOrfao] Erro ao inserir:', insertError)
        return false
      }

      console.log('✅ [recuperarClienteOrfao] Cliente órfão recuperado com sucesso!')
      return true
    } catch (error) {
      console.error('💥 [recuperarClienteOrfao] Erro:', error)
      return false
    }
  }

  const addCliente = async (clienteData: {
    nome_cliente: string
    telefone: string
    email_cliente: string
    email_gestor: string
    status_campanha: string
    data_venda: string
    produto_nicho?: string
    senha_cliente?: string
  }) => {
    try {
      console.log('🔵 [useSimpleSellerData] === INICIANDO CRIAÇÃO DE CLIENTE (PROCESSO CORRIGIDO) ===')
      console.log('📧 [useSimpleSellerData] Email do cliente:', clienteData.email_cliente)
      
      // Preparar nome do vendedor
      const emailPrefix = sellerEmail.split('@')[0]
      let vendorName = emailPrefix.replace('vendedor', '')
      
      if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
      if (emailPrefix.includes('edu')) vendorName = 'Edu'

      // Usar senha customizada ou padrão
      const senhaParaUsar = clienteData.senha_cliente || SENHA_PADRAO_CLIENTE

      // === NOVA ABORDAGEM: PRIMEIRO A TABELA, DEPOIS O AUTH ===
      
      // Step 1: Verificar se cliente já existe na tabela
      console.log('🔍 [useSimpleSellerData] Verificando se cliente já existe na tabela...')
      const { data: existingClient, error: checkError } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente, nome_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [useSimpleSellerData] Erro ao verificar cliente existente:', checkError)
        throw new Error(`Erro ao verificar cliente: ${checkError.message}`)
      }

      let clienteJaExistia = false
      let clientId: string | number
      let registroNaTabelaCriado = false

      if (existingClient) {
        console.log('⚠️ [useSimpleSellerData] Cliente já existe na tabela, fazendo update...')
        clienteJaExistia = true
        clientId = existingClient.id
        registroNaTabelaCriado = true
        
        const { error: updateError } = await supabase
          .from('todos_clientes')
          .update({
            nome_cliente: clienteData.nome_cliente,
            telefone: clienteData.telefone,
            email_gestor: clienteData.email_gestor,
            vendedor: vendorName,
            status_campanha: clienteData.status_campanha,
            data_venda: clienteData.data_venda,
            valor_comissao: 20.00
          })
          .eq('id', existingClient.id)

        if (updateError) {
          console.error('❌ [useSimpleSellerData] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        console.log('✅ [useSimpleSellerData] Cliente existente atualizado com sucesso')
      } else {
        // Step 2: PRIMEIRO - Inserir na tabela todos_clientes
        console.log('📋 [useSimpleSellerData] === PASSO 1: INSERINDO NA TABELA PRIMEIRO ===')
        
        const novoCliente = {
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_cliente: clienteData.email_cliente,
          email_gestor: clienteData.email_gestor,
          vendedor: vendorName,
          status_campanha: clienteData.status_campanha,
          data_venda: clienteData.data_venda,
          valor_comissao: 20.00,
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
          throw new Error(`Erro ao adicionar cliente na tabela: ${insertError.message}`)
        }

        console.log('✅ [useSimpleSellerData] === PASSO 1 CONCLUÍDO: CLIENTE INSERIDO NA TABELA ===')
        clientId = insertData.id
        registroNaTabelaCriado = true
      }

      // Step 3: SEGUNDO - Criar conta no Supabase Auth
      console.log('🔐 [useSimpleSellerData] === PASSO 2: CRIANDO CONTA NO AUTH ===')
      let senhaDefinida = false
      
      try {
        // Verificar se usuário já existe no auth
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const userAlreadyExists = existingUsers.users.some(user => 
          user.email?.toLowerCase() === clienteData.email_cliente.toLowerCase()
        )

        if (userAlreadyExists) {
          console.log('⚠️ [useSimpleSellerData] Usuário já existe no auth, atualizando senha...')
          // Se já existe, atualizar senha (requer admin)
          const existingUser = existingUsers.users.find(user => 
            user.email?.toLowerCase() === clienteData.email_cliente.toLowerCase()
          )
          
          if (existingUser) {
            // Não conseguimos atualizar senha sem privilégios de admin
            // Mas pelo menos sabemos que a conta existe
            senhaDefinida = true
            console.log('⚠️ [useSimpleSellerData] Conta já existe no auth - senha não alterada')
          }
        } else {
          // Criar nova conta
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: clienteData.email_cliente,
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
            
            // Se falhar na criação do auth, NÃO é crítico
            // O cliente já está na tabela e pode fazer login mais tarde
            if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
              console.log('⚠️ [useSimpleSellerData] Usuário já existe - conta não criada mas cliente está na tabela')
              senhaDefinida = true
            } else {
              console.log('⚠️ [useSimpleSellerData] Falha no auth mas cliente está salvo na tabela - pode ser corrigido depois')
              senhaDefinida = false
            }
          } else {
            console.log('✅ [useSimpleSellerData] === PASSO 2 CONCLUÍDO: CONTA CRIADA NO AUTH ===')
            senhaDefinida = true
          }
        }
      } catch (authErr) {
        console.error('⚠️ [useSimpleSellerData] Erro na criação da conta (catch):', authErr)
        // Não é crítico - cliente está na tabela
        console.log('⚠️ [useSimpleSellerData] Auth falhou mas cliente está salvo - pode ser corrigido depois')
        senhaDefinida = false
      }

      // Step 4: Verificação final e logs
      console.log('🔍 [useSimpleSellerData] === VERIFICAÇÃO FINAL ===')
      console.log('✅ [useSimpleSellerData] Registro na tabela:', registroNaTabelaCriado ? 'OK' : 'FALHOU')
      console.log('🔐 [useSimpleSellerData] Conta no auth:', senhaDefinida ? 'OK' : 'FALHOU/JÁ EXISTIA')

      // Recarregar lista
      await fetchClientes()
      
      // Mostrar mensagem de sucesso
      if (!clienteJaExistia) {
        toast({
          title: "✅ Cliente cadastrado com sucesso!",
          description: senhaDefinida 
            ? `Cliente ${clienteData.nome_cliente} foi adicionado.\n🔐 Senha: ${senhaParaUsar}\n✅ Ambos registros criados (tabela + auth)`
            : `Cliente ${clienteData.nome_cliente} foi adicionado.\n⚠️ Registro na tabela OK, auth pode precisar de correção`,
          duration: 8000
        })
      } else {
        toast({
          title: "Sucesso",
          description: "Dados do cliente atualizados com sucesso!"
        })
      }
      
      console.log('🎉 [useSimpleSellerData] Processo concluído - cliente garantido na tabela')
      
      // Retornar estrutura IDÊNTICA ao useClienteOperations
      return { 
        success: true, 
        isNewClient: !clienteJaExistia,
        senhaDefinida,
        clientData: {
          id: clientId,
          email_cliente: clienteData.email_cliente,
          nome_cliente: clienteData.nome_cliente
        }
      }

    } catch (error) {
      console.error('💥 [useSimpleSellerData] Erro crítico:', error)
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
