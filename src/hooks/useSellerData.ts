
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface SellerMetrics {
  clientsToday: number
  clientsThisWeek: number
  clientsThisMonth: number
  clientsThisYear: number
  salesToday: number
  salesYesterday: number
  salesThisMonth: number
  salesAllTime: number
}

export function useSellerData(sellerEmail: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [metrics, setMetrics] = useState<SellerMetrics>({
    clientsToday: 0,
    clientsThisWeek: 0,
    clientsThisMonth: 0,
    clientsThisYear: 0,
    salesToday: 0,
    salesYesterday: 0,
    salesThisMonth: 0,
    salesAllTime: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchSellerClientes = async () => {
    if (!sellerEmail) return

    try {
      setLoading(true)
      console.log('🔍 [useSellerData] Buscando clientes para vendedor:', sellerEmail)

      // Fetch clients where vendedor = seller's email
      const { data: clientesData, error: clientesError } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('vendedor', sellerEmail)
        .order('created_at', { ascending: false })

      if (clientesError) {
        console.error('❌ [useSellerData] Erro ao buscar clientes:', clientesError)
        toast({
          title: "Erro",
          description: "Erro ao carregar clientes",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [useSellerData] Clientes encontrados:', clientesData?.length || 0)
      console.log('📋 [useSellerData] Lista de clientes:', clientesData?.map(c => ({ 
        nome: c.nome_cliente, 
        email: c.email_cliente, 
        created_at: c.created_at,
        vendedor: c.vendedor
      })))

      // Log específico para clientes de hoje
      const today = new Date().toISOString().split('T')[0]
      const clientesToday = clientesData?.filter(c => {
        if (!c.created_at) return false
        const clientDate = new Date(c.created_at).toISOString().split('T')[0]
        return clientDate === today
      }) || []
      
      console.log('📅 [useSellerData] Clientes cadastrados hoje:', clientesToday.length)
      console.log('📝 [useSellerData] Detalhes dos clientes de hoje:', clientesToday.map(c => ({
        nome: c.nome_cliente,
        email: c.email_cliente,
        hora_cadastro: c.created_at
      })))

      setClientes(clientesData || [])

      // Calculate metrics
      await calculateMetrics(clientesData || [])

    } catch (error) {
      console.error('💥 [useSellerData] Erro crítico:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = async (clientesData: Cliente[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Client registration metrics
    const clientsToday = clientesData.filter(c => 
      c.created_at && new Date(c.created_at) >= today
    ).length

    const clientsThisWeek = clientesData.filter(c => 
      c.created_at && new Date(c.created_at) >= weekStart
    ).length

    const clientsThisMonth = clientesData.filter(c => 
      c.created_at && new Date(c.created_at) >= monthStart
    ).length

    const clientsThisYear = clientesData.filter(c => 
      c.created_at && new Date(c.created_at) >= yearStart
    ).length

    // Sales metrics based on comissao_paga and data_venda
    const paidClients = clientesData.filter(c => c.comissao_paga)

    const salesToday = paidClients.filter(c => 
      c.data_venda && new Date(c.data_venda) >= today
    ).reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    const salesYesterday = paidClients.filter(c => 
      c.data_venda && 
      new Date(c.data_venda) >= yesterday && 
      new Date(c.data_venda) < today
    ).reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    const salesThisMonth = paidClients.filter(c => 
      c.data_venda && new Date(c.data_venda) >= monthStart
    ).reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    const salesAllTime = paidClients.reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    console.log('📊 [useSellerData] Métricas calculadas:', {
      clientsToday,
      clientsThisWeek,
      clientsThisMonth,
      clientsThisYear,
      salesToday,
      salesYesterday,
      salesThisMonth,
      salesAllTime
    })

    setMetrics({
      clientsToday,
      clientsThisWeek,
      clientsThisMonth,
      clientsThisYear,
      salesToday,
      salesYesterday,
      salesThisMonth,
      salesAllTime
    })
  }

  const checkClientExists = async (emailCliente: string): Promise<{ exists: boolean; foundClient?: Cliente }> => {
    try {
      console.log('🔍 [useSellerData] Verificando se cliente existe:', emailCliente)
      
      // Buscar em toda a tabela, não apenas do vendedor atual
      const { data: allClients, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', emailCliente)

      if (error) {
        console.error('❌ [useSellerData] Erro ao verificar cliente existente:', error)
        return { exists: false }
      }

      console.log('🔍 [useSellerData] Resultado da busca:', allClients)

      if (allClients && allClients.length > 0) {
        const foundClient = allClients[0]
        console.log('⚠️ [useSellerData] Cliente JÁ EXISTE:', {
          nome: foundClient.nome_cliente,
          email: foundClient.email_cliente,
          vendedor: foundClient.vendedor,
          created_at: foundClient.created_at
        })
        return { exists: true, foundClient }
      }

      console.log('✅ [useSellerData] Cliente NÃO existe, pode prosseguir')
      return { exists: false }

    } catch (error) {
      console.error('💥 [useSellerData] Erro ao verificar duplicata:', error)
      return { exists: false }
    }
  }

  const addCliente = async (clienteData: any) => {
    try {
      console.log('🚀 [useSellerData] Verificando duplicata para:', clienteData.email_cliente)
      
      // Check for duplicates first
      const { exists, foundClient } = await checkClientExists(clienteData.email_cliente)
      
      if (exists) {
        console.log('❌ [useSellerData] DUPLICATA DETECTADA!')
        toast({
          title: "Cliente já existe",
          description: `Este email já está cadastrado no sistema${foundClient?.vendedor ? ` pelo vendedor: ${foundClient.vendedor}` : ''}`,
          variant: "destructive"
        })
        return { success: false, duplicate: true }
      }

      // Insert new client with seller's email as vendedor
      const novoCliente = {
        nome_cliente: String(clienteData.nome_cliente || ''),
        telefone: String(clienteData.telefone || ''),
        email_cliente: String(clienteData.email_cliente || ''),
        data_venda: clienteData.data_venda || null,
        vendedor: sellerEmail, // Auto-fill with seller's email
        status_campanha: String(clienteData.status_campanha || 'Brief'),
        email_gestor: String(clienteData.email_gestor || ''),
        comissao_paga: false,
        valor_comissao: 60.00,
        site_status: 'pendente',
        data_limite: '',
        link_grupo: '',
        link_briefing: '',
        link_criativo: '',
        link_site: '',
        numero_bm: '',
        created_at: new Date().toISOString()
      }

      console.log('📤 [useSellerData] Inserindo novo cliente:', novoCliente)

      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([novoCliente])
        .select()
        .single()

      if (error) {
        console.error('❌ [useSellerData] Erro ao inserir cliente:', error)
        toast({
          title: "Erro",
          description: `Erro ao adicionar cliente: ${error.message}`,
          variant: "destructive"
        })
        return { success: false, duplicate: false }
      }

      console.log('✅ [useSellerData] Cliente adicionado com sucesso:', data)
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `Cliente "${clienteData.nome_cliente}" foi adicionado à sua lista.`,
        duration: 3000
      })

      // Refresh data immediately
      await fetchSellerClientes()

      return { success: true, duplicate: false, clientData: data }

    } catch (error) {
      console.error('💥 [useSellerData] Erro crítico ao adicionar cliente:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return { success: false, duplicate: false }
    }
  }

  // Debug function to list all clients from database
  const debugListAllClients = async () => {
    try {
      console.log('🕵️ [DEBUG] Listando TODOS os clientes da base de dados...')
      
      const { data: allClients, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [DEBUG] Erro ao buscar todos os clientes:', error)
        return
      }

      console.log('📊 [DEBUG] Total de clientes na base:', allClients?.length || 0)
      
      // Filtrar por vendedores específicos
      const targetSellers = ['vendedoritamar@trafegoporcents.com', 'vendedoredu@trafegoporcents.com']
      const clientsByTargetSellers = allClients?.filter(c => 
        targetSellers.includes(c.vendedor)
      ) || []

      console.log('🎯 [DEBUG] Clientes dos vendedores alvo:', clientsByTargetSellers.length)
      
      // Clientes de hoje
      const today = new Date().toISOString().split('T')[0]
      const clientsToday = allClients?.filter(c => {
        if (!c.created_at) return false
        const clientDate = new Date(c.created_at).toISOString().split('T')[0]
        return clientDate === today
      }) || []

      console.log('📅 [DEBUG] Clientes cadastrados hoje (26/05):', clientsToday.length)
      console.log('📝 [DEBUG] Lista detalhada:', clientsToday.map(c => ({
        nome: c.nome_cliente,
        email: c.email_cliente,
        vendedor: c.vendedor,
        created_at: c.created_at
      })))

    } catch (error) {
      console.error('💥 [DEBUG] Erro ao listar clientes:', error)
    }
  }

  useEffect(() => {
    fetchSellerClientes()
    // Executar debug na primeira carga
    debugListAllClients()
  }, [sellerEmail])

  // Setup realtime updates for seller's clients
  useEffect(() => {
    if (!sellerEmail) return

    const channel = supabase
      .channel(`seller-clients-${sellerEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos_clientes',
          filter: `vendedor=eq.${sellerEmail}`
        },
        () => {
          console.log('🔄 [useSellerData] Mudança detectada, atualizando dados...')
          fetchSellerClientes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sellerEmail])

  return {
    clientes,
    metrics,
    loading,
    addCliente,
    refetch: fetchSellerClientes,
    debugListAllClients
  }
}
