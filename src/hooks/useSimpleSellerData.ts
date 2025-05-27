
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

  const addCliente = async (clienteData: {
    nome_cliente: string
    telefone: string
    email_cliente: string
    email_gestor: string
    status_campanha: string
    data_venda: string
  }) => {
    try {
      console.log('🔵 [useSimpleSellerData] Iniciando criação de cliente')
      console.log('📧 [useSimpleSellerData] Email do cliente:', clienteData.email_cliente)
      
      // Verificar se cliente já existe na tabela
      const { data: existingClient } = await supabase
        .from('todos_clientes')
        .select('id, email_cliente, nome_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .maybeSingle()

      let clienteJaExistia = false
      let senhaDefinida = false
      let clientId: string | number

      if (existingClient) {
        console.log('⚠️ [useSimpleSellerData] Cliente já existe, fazendo update dos dados...')
        clienteJaExistia = true
        
        // Preparar nome do vendedor
        const emailPrefix = sellerEmail.split('@')[0]
        let vendorName = emailPrefix.replace('vendedor', '')
        
        if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
        if (emailPrefix.includes('edu')) vendorName = 'Edu'

        const { data: updatedData, error: updateError } = await supabase
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
          .select()
          .single()

        if (updateError) {
          console.error('❌ [useSimpleSellerData] Erro ao atualizar cliente existente:', updateError)
          toast({
            title: "Erro",
            description: "Erro ao atualizar cliente existente",
            variant: "destructive"
          })
          return { success: false, isNewClient: false, senhaDefinida: false }
        }

        clientId = updatedData.id
        console.log('✅ [useSimpleSellerData] Cliente existente atualizado com sucesso')
      } else {
        // Cliente novo - inserir na tabela primeiro
        const emailPrefix = sellerEmail.split('@')[0]
        let vendorName = emailPrefix.replace('vendedor', '')
        
        if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
        if (emailPrefix.includes('edu')) vendorName = 'Edu'

        console.log('📋 [useSimpleSellerData] Inserindo cliente na tabela todos_clientes...')
        const { data: insertData, error: insertError } = await supabase
          .from('todos_clientes')
          .insert({
            nome_cliente: clienteData.nome_cliente,
            telefone: clienteData.telefone,
            email_cliente: clienteData.email_cliente,
            email_gestor: clienteData.email_gestor,
            vendedor: vendorName,
            status_campanha: clienteData.status_campanha,
            data_venda: clienteData.data_venda,
            valor_comissao: 20.00
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ [useSimpleSellerData] Erro ao inserir na tabela:', insertError)
          toast({
            title: "Erro",
            description: "Erro ao adicionar cliente na tabela",
            variant: "destructive"
          })
          return { success: false, isNewClient: false, senhaDefinida: false }
        }

        console.log('✅ [useSimpleSellerData] Cliente inserido na tabela com sucesso!')
        clientId = insertData.id

        // Tentar criar conta de autenticação (opcional)
        console.log('🔐 [useSimpleSellerData] Tentando criar conta no Supabase Auth...')
        
        try {
          const { error: authError } = await supabase.auth.signUp({
            email: clienteData.email_cliente,
            password: SENHA_PADRAO_CLIENTE,
            options: {
              data: {
                full_name: clienteData.nome_cliente,
                role: 'cliente'
              }
            }
          })

          if (authError) {
            console.warn('⚠️ [useSimpleSellerData] Erro na criação da conta Auth:', authError)
            // Não bloquear se a conta já existir
            if (authError.message.includes('already registered')) {
              console.log('💡 [useSimpleSellerData] Email já possui conta no sistema')
            }
          } else {
            console.log('✅ [useSimpleSellerData] Conta criada com sucesso!')
            senhaDefinida = true
          }
        } catch (authError) {
          console.warn('⚠️ [useSimpleSellerData] Erro inesperado na criação da conta:', authError)
        }
      }

      // Recarregar lista
      await fetchClientes()
      
      // Mostrar mensagem de sucesso
      if (!clienteJaExistia) {
        toast({
          title: "✅ Cliente cadastrado com sucesso!",
          description: senhaDefinida 
            ? `Cliente ${clienteData.nome_cliente} foi adicionado.\n🔐 Senha padrão: ${SENHA_PADRAO_CLIENTE}`
            : `Cliente ${clienteData.nome_cliente} foi adicionado.`,
          duration: 5000
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
        clientData: {
          id: clientId,
          email_cliente: clienteData.email_cliente,
          nome_cliente: clienteData.nome_cliente
        }
      }

    } catch (error) {
      console.error('💥 [useSimpleSellerData] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar cliente",
        variant: "destructive"
      })
      return { success: false, isNewClient: false, senhaDefinida: false }
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
