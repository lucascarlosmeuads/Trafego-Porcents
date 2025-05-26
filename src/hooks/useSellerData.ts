
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
    if (!sellerEmail) {
      console.log('⚠️ [useSellerData] No seller email provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('🔍 [useSellerData] === FETCHING CLIENTS FOR SELLER ===')
      console.log('📧 [useSellerData] Seller email:', sellerEmail)

      // First, let's check the database connection and table structure
      const { data: testConnection, error: connectionError } = await supabase
        .from('todos_clientes')
        .select('count(*)')
        .limit(1)

      if (connectionError) {
        console.error('❌ [useSellerData] Database connection error:', connectionError)
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao banco de dados",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [useSellerData] Database connection successful')

      // Fetch all clients for debugging (sample to verify data exists)
      const { data: allClientsCount, error: countError } = await supabase
        .from('todos_clientes')
        .select('vendedor', { count: 'exact' })

      if (!countError) {
        console.log('📊 [useSellerData] Total clients in database:', allClientsCount?.length || 0)
      }

      // Get unique vendors for debugging
      const { data: uniqueVendors, error: vendorError } = await supabase
        .from('todos_clientes')
        .select('vendedor')
        .not('vendedor', 'is', null)

      if (!vendorError && uniqueVendors) {
        const vendors = [...new Set(uniqueVendors.map(v => v.vendedor))]
        console.log('👥 [useSellerData] Unique vendors in database:', vendors)
        console.log('🔍 [useSellerData] Looking for exact match:', sellerEmail)
      }

      // Main query - fetch clients for this specific seller
      console.log('🔎 [useSellerData] Executing main query...')
      const { data: clientesData, error: clientesError } = await supabase
        .from('todos_clientes')
        .select(`
          id,
          nome_cliente,
          email_cliente,
          telefone,
          vendedor,
          email_gestor,
          status_campanha,
          data_venda,
          created_at,
          comissao_paga,
          valor_comissao,
          site_status,
          descricao_problema,
          saque_solicitado
        `)
        .eq('vendedor', sellerEmail)
        .order('created_at', { ascending: false })

      if (clientesError) {
        console.error('❌ [useSellerData] Query error:', clientesError)
        toast({
          title: "Erro ao carregar clientes",
          description: `Erro na consulta: ${clientesError.message}`,
          variant: "destructive"
        })
        return
      }

      console.log('📊 [useSellerData] Query result:', {
        found: clientesData?.length || 0,
        data: clientesData
      })

      if (clientesData && clientesData.length > 0) {
        console.log('✅ [useSellerData] Clients found for seller:', clientesData.length)
        console.log('📋 [useSellerData] Client details:')
        clientesData.forEach((cliente, index) => {
          console.log(`   ${index + 1}. ${cliente.nome_cliente} (${cliente.email_cliente}) - Created: ${cliente.created_at}`)
        })
      } else {
        console.log('⚠️ [useSellerData] No clients found for seller:', sellerEmail)
        
        // Additional debugging - check for similar emails
        const { data: similarClients } = await supabase
          .from('todos_clientes')
          .select('vendedor, nome_cliente, email_cliente, created_at')
          .ilike('vendedor', `%${sellerEmail.split('@')[0]}%`)

        if (similarClients && similarClients.length > 0) {
          console.log('🔍 [useSellerData] Found clients with similar vendor emails:', similarClients)
        }
      }

      setClientes(clientesData || [])
      await calculateMetrics(clientesData || [])

    } catch (error) {
      console.error('💥 [useSellerData] Critical error:', error)
      toast({
        title: "Erro Crítico",
        description: "Erro inesperado ao carregar dados do vendedor",
        variant: "destructive"
      })
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

    // Sales metrics based on commission data
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

    console.log('📊 [useSellerData] Calculated metrics:', {
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
      console.log('🔍 [useSellerData] Checking if client exists:', emailCliente)
      
      const { data: existingClient, error } = await supabase
        .from('todos_clientes')
        .select('*')
        .eq('email_cliente', emailCliente)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [useSellerData] Error checking existing client:', error)
        return { exists: false }
      }

      if (existingClient) {
        console.log('⚠️ [useSellerData] CLIENT ALREADY EXISTS:', {
          nome: existingClient.nome_cliente,
          email: existingClient.email_cliente,
          vendedor: existingClient.vendedor,
          created_at: existingClient.created_at
        })
        return { exists: true, foundClient: existingClient }
      }

      console.log('✅ [useSellerData] Client does not exist, can proceed')
      return { exists: false }

    } catch (error) {
      console.error('💥 [useSellerData] Error checking for duplicates:', error)
      return { exists: false }
    }
  }

  const addCliente = async (clienteData: any) => {
    try {
      console.log('🚀 [useSellerData] Starting client addition:', clienteData.email_cliente)
      
      // Check for duplicates first
      const { exists, foundClient } = await checkClientExists(clienteData.email_cliente)
      
      if (exists) {
        console.log('❌ [useSellerData] DUPLICATE DETECTED!')
        toast({
          title: "Cliente já existe",
          description: `Este email já está cadastrado${foundClient?.vendedor ? ` pelo vendedor: ${foundClient.vendedor}` : ''}`,
          variant: "destructive"
        })
        return { success: false, duplicate: true }
      }

      // Insert new client
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

      console.log('📤 [useSellerData] Inserting new client:', novoCliente)

      const { data, error } = await supabase
        .from('todos_clientes')
        .insert([novoCliente])
        .select()
        .single()

      if (error) {
        console.error('❌ [useSellerData] Error inserting client:', error)
        toast({
          title: "Erro",
          description: `Erro ao adicionar cliente: ${error.message}`,
          variant: "destructive"
        })
        return { success: false, duplicate: false }
      }

      console.log('✅ [useSellerData] Client added successfully:', data)
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `Cliente "${clienteData.nome_cliente}" foi adicionado à sua lista.`,
        duration: 3000
      })

      // Refresh data immediately
      await fetchSellerClientes()

      return { success: true, duplicate: false, clientData: data }

    } catch (error) {
      console.error('💥 [useSellerData] Critical error adding client:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive"
      })
      return { success: false, duplicate: false }
    }
  }

  useEffect(() => {
    if (sellerEmail) {
      console.log('🔄 [useSellerData] Initial fetch triggered for:', sellerEmail)
      fetchSellerClientes()
    }
  }, [sellerEmail])

  // Setup realtime updates
  useEffect(() => {
    if (!sellerEmail) return

    console.log('📡 [useSellerData] Setting up realtime subscription for:', sellerEmail)
    
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
        (payload) => {
          console.log('🔄 [useSellerData] Realtime update detected:', payload)
          fetchSellerClientes()
        }
      )
      .subscribe()

    return () => {
      console.log('🔌 [useSellerData] Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [sellerEmail])

  return {
    clientes,
    metrics,
    loading,
    addCliente,
    refetch: fetchSellerClientes
  }
}
