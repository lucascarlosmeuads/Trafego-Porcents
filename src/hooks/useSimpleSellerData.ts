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
      // Verificar se cliente já existe
      const { data: existingClient } = await supabase
        .from('todos_clientes')
        .select('email_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .maybeSingle()

      if (existingClient) {
        toast({
          title: "Cliente já existe",
          description: "Este email já está cadastrado",
          variant: "destructive"
        })
        return { success: false, duplicate: true }
      }

      // Preparar nome do vendedor
      const emailPrefix = sellerEmail.split('@')[0]
      let vendorName = emailPrefix.replace('vendedor', '')
      
      if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
      if (emailPrefix.includes('edu')) vendorName = 'Edu'

      // Inserir cliente
      const { error } = await supabase
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

      if (error) {
        console.error('Erro ao inserir:', error)
        toast({
          title: "Erro",
          description: "Erro ao adicionar cliente",
          variant: "destructive"
        })
        return { success: false, duplicate: false }
      }

      // Criar conta de usuário com senha padrão
      let senhaDefinida = false
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
          console.error('Erro ao criar conta:', authError)
        } else {
          senhaDefinida = true
        }
      } catch (authErr) {
        console.error('Erro na criação da conta:', authErr)
      }

      // Recarregar lista
      await fetchClientes()
      
      // Mostrar mensagem de sucesso com informação da senha
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: senhaDefinida 
          ? `🔐 Senha padrão definida como: ${SENHA_PADRAO_CLIENTE}`
          : "Cliente adicionado à lista.",
        duration: 5000
      })
      
      return { success: true, duplicate: false, senhaDefinida }

    } catch (error) {
      console.error('Erro:', error)
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
