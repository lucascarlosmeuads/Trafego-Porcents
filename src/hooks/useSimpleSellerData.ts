
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
  }) => {
    try {
      console.log('🔐 [useSimpleSellerData] === INICIANDO CRIAÇÃO DE CLIENTE ===')
      console.log('📧 [useSimpleSellerData] Email do cliente:', clienteData.email_cliente)
      
      // Verificar se cliente já existe na tabela
      const { data: existingClient } = await supabase
        .from('todos_clientes')
        .select('email_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .maybeSingle()

      if (existingClient) {
        console.log('❌ [useSimpleSellerData] Cliente já existe na tabela')
        toast({
          title: "Cliente já existe",
          description: "Este email já está cadastrado",
          variant: "destructive"
        })
        return { success: false, duplicate: true }
      }

      // PASSO 1: Criar conta de autenticação no Supabase Auth
      console.log('🔐 [useSimpleSellerData] Criando conta no Supabase Auth...')
      console.log('🔑 [useSimpleSellerData] Email:', clienteData.email_cliente)
      console.log('🔑 [useSimpleSellerData] Senha padrão:', SENHA_PADRAO_CLIENTE)
      
      // Fazer logout da sessão atual para evitar conflitos
      await supabase.auth.signOut()
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clienteData.email_cliente,
        password: SENHA_PADRAO_CLIENTE,
        options: {
          emailRedirectTo: undefined // Evita envio de email de confirmação
        }
      })

      let contaCriada = false
      
      if (authError) {
        console.error('❌ [useSimpleSellerData] Erro na criação da conta Auth:', authError)
        
        // Se o usuário já existe no Auth, isso pode ser aceitável
        if (authError.message?.includes('User already registered') || authError.code === 'user_already_exists') {
          console.log('⚠️ [useSimpleSellerData] Usuário já existe no Auth, continuando...')
          contaCriada = true
        } else {
          toast({
            title: "Erro na criação da conta",
            description: `Falha ao criar conta de acesso: ${authError.message}`,
            variant: "destructive"
          })
          return { success: false, duplicate: false }
        }
      } else {
        console.log('✅ [useSimpleSellerData] Conta criada com sucesso no Supabase Auth!')
        console.log('👤 [useSimpleSellerData] ID do usuário:', authData.user?.id)
        contaCriada = true
      }

      // PASSO 2: Preparar nome do vendedor
      const emailPrefix = sellerEmail.split('@')[0]
      let vendorName = emailPrefix.replace('vendedor', '')
      
      if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
      if (emailPrefix.includes('edu')) vendorName = 'Edu'

      // PASSO 3: Inserir cliente na tabela todos_clientes
      console.log('📋 [useSimpleSellerData] Inserindo cliente na tabela todos_clientes...')
      const { error: insertError } = await supabase
        .from('todos_clientes')
        .insert({
          nome_cliente: clienteData.nome_cliente,
          telefone: clienteData.telefone,
          email_cliente: clienteData.email_cliente,
          email_gestor: clienteData.email_gestor,
          vendedor: vendorName,
          status_campanha: 'Brief',
          valor_comissao: 20.00
        })

      if (insertError) {
        console.error('❌ [useSimpleSellerData] Erro ao inserir na tabela:', insertError)
        toast({
          title: "Erro",
          description: "Erro ao adicionar cliente na tabela",
          variant: "destructive"
        })
        return { success: false, duplicate: false }
      }

      console.log('✅ [useSimpleSellerData] Cliente inserido na tabela com sucesso!')

      // PASSO 4: Recarregar lista
      await fetchClientes()
      
      // PASSO 5: Mostrar mensagem de sucesso
      toast({
        title: "✅ Cliente cadastrado com sucesso!",
        description: `🔐 Senha padrão: ${SENHA_PADRAO_CLIENTE}`,
        duration: 8000
      })
      
      console.log('🎉 [useSimpleSellerData] === PROCESSO CONCLUÍDO COM SUCESSO ===')
      console.log('📧 [useSimpleSellerData] Email:', clienteData.email_cliente)
      console.log('🔑 [useSimpleSellerData] Senha:', SENHA_PADRAO_CLIENTE)
      console.log('✅ [useSimpleSellerData] Conta de auth criada:', contaCriada)
      
      return { success: true, duplicate: false, senhaDefinida: contaCriada }

    } catch (error) {
      console.error('💥 [useSimpleSellerData] Erro inesperado:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar cliente",
        variant: "destructive"
      })
      return { success: false, duplicate: false, senhaDefinida: false }
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
