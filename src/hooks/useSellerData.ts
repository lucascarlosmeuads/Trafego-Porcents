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

      // Test database connection first
      const { data: testConnection, error: connectionError } = await supabase
        .from('todos_clientes')
        .select('id')
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

      // Extract seller name from email for matching
      const emailPrefix = sellerEmail.split('@')[0]
      let sellerName = emailPrefix.replace('vendedor', '').toLowerCase()
      
      // Handle specific cases
      if (emailPrefix.includes('itamar')) sellerName = 'itamar'
      if (emailPrefix.includes('edu')) sellerName = 'edu'
      
      console.log('🏷️ [useSellerData] Extracted seller name:', sellerName)

      // Try multiple query strategies to match the seller
      console.log('🔎 [useSellerData] Trying seller matching strategies...')
      
      // Strategy 1: Exact email match
      let { data: clientesData, error: clientesError } = await supabase
        .from('todos_clientes')
        .select(`
          id,
          nome_cliente,
          telefone,
          email_cliente,
          vendedor,
          email_gestor,
          status_campanha,
          created_at,
          comissao_paga,
          valor_comissao,
          comissao,
          site_pago
        `)
        .eq('vendedor', sellerEmail)
        .order('created_at', { ascending: false, nullsFirst: false })

      console.log('📊 [useSellerData] Exact email match result:', clientesData?.length || 0)

      // Strategy 2: If no exact match, try partial name matching
      if (!clientesData || clientesData.length === 0) {
        console.log('🔍 [useSellerData] Trying name-based matching...')
        
        const { data: nameMatchData, error: nameMatchError } = await supabase
          .from('todos_clientes')
          .select(`
            id,
            nome_cliente,
            telefone,
            email_cliente,
            vendedor,
            email_gestor,
            status_campanha,
            created_at,
            comissao_paga,
            valor_comissao,
            comissao,
            site_pago
          `)
          .ilike('vendedor', `%${sellerName}%`)
          .order('created_at', { ascending: false, nullsFirst: false })

        if (!nameMatchError && nameMatchData) {
          clientesData = nameMatchData
          console.log('📊 [useSellerData] Name-based match result:', clientesData.length)
        }
      }

      // Strategy 3: Try exact name match (capitalized)
      if (!clientesData || clientesData.length === 0) {
        const capitalizedName = sellerName.charAt(0).toUpperCase() + sellerName.slice(1)
        console.log('🔍 [useSellerData] Trying capitalized name match:', capitalizedName)
        
        const { data: capitalizedMatchData, error: capitalizedError } = await supabase
          .from('todos_clientes')
          .select(`
            id,
            nome_cliente,
            telefone,
            email_cliente,
            vendedor,
            email_gestor,
            status_campanha,
            created_at,
            comissao_paga,
            valor_comissao,
            comissao,
            site_pago
          `)
          .eq('vendedor', capitalizedName)
          .order('created_at', { ascending: false, nullsFirst: false })

        if (!capitalizedError && capitalizedMatchData) {
          clientesData = capitalizedMatchData
          console.log('📊 [useSellerData] Capitalized name match result:', clientesData.length)
        }
      }

      if (clientesError) {
        console.error('❌ [useSellerData] Query error:', clientesError)
        toast({
          title: "Erro ao carregar clientes",
          description: `Erro na consulta: ${clientesError.message}`,
          variant: "destructive"
        })
        return
      }

      if (clientesData && clientesData.length > 0) {
        console.log('✅ [useSellerData] Clients found for seller:', clientesData.length)
        console.log('📋 [useSellerData] Client details with created_at:')
        clientesData.forEach((cliente, index) => {
          console.log(`   ${index + 1}. ${cliente.nome_cliente} (${cliente.email_cliente}) - Vendedor: ${cliente.vendedor} - Created At: ${cliente.created_at}`)
        })

        // Format data to match Cliente type
        const formattedClientes: Cliente[] = clientesData.map(item => ({
          id: String(item.id || ''),
          data_venda: '', // Not using data_venda anymore
          nome_cliente: item.nome_cliente || '',
          telefone: item.telefone || '',
          email_cliente: item.email_cliente || '',
          vendedor: item.vendedor || '',
          email_gestor: item.email_gestor || '',
          status_campanha: item.status_campanha || 'Brief',
          data_limite: '',
          link_grupo: '',
          link_briefing: '',
          link_criativo: '',
          link_site: '',
          numero_bm: '',
          comissao_paga: Boolean(item.comissao_paga),
          valor_comissao: Number(item.valor_comissao || 60),
          created_at: item.created_at || '',
          site_status: 'pendente',
          descricao_problema: '',
          saque_solicitado: false,
          comissao: item.comissao || 'Pendente',
          site_pago: Boolean(item.site_pago || false)
        }))

        console.log('🔍 [useSellerData] Formatted clients with created_at:', formattedClientes.map(c => ({ 
          nome: c.nome_cliente, 
          created_at: c.created_at
        })))

        setClientes(formattedClientes)
        await calculateMetrics(formattedClientes)
      } else {
        console.log('⚠️ [useSellerData] No clients found for seller:', sellerEmail)
        setClientes([])
        await calculateMetrics([])
      }

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

    console.log('📊 [useSellerData] Calculating metrics based on created_at')
    console.log('📅 [useSellerData] Reference dates:', {
      today: today.toDateString(),
      yesterday: yesterday.toDateString(),
      weekStart: weekStart.toDateString()
    })

    // Client registration metrics based on created_at
    const clientsToday = clientesData.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        clientDate.setHours(0, 0, 0, 0)
        return clientDate.getTime() === today.getTime()
      } catch (error) {
        return false
      }
    }).length

    const clientsThisWeek = clientesData.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        return clientDate >= weekStart
      } catch (error) {
        return false
      }
    }).length

    const clientsThisMonth = clientesData.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        return clientDate >= monthStart
      } catch (error) {
        return false
      }
    }).length

    const clientsThisYear = clientesData.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        return clientDate >= yearStart
      } catch (error) {
        return false
      }
    }).length

    // Sales metrics based on commission data and created_at
    const paidClients = clientesData.filter(c => c.comissao_paga)

    const salesToday = paidClients.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        clientDate.setHours(0, 0, 0, 0)
        return clientDate.getTime() === today.getTime()
      } catch (error) {
        return false
      }
    }).reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    const salesYesterday = paidClients.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        clientDate.setHours(0, 0, 0, 0)
        return clientDate.getTime() === yesterday.getTime()
      } catch (error) {
        return false
      }
    }).reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    const salesThisMonth = paidClients.filter(c => {
      if (!c.created_at) return false
      try {
        const clientDate = new Date(c.created_at)
        return clientDate >= monthStart
      } catch (error) {
        return false
      }
    }).reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    const salesAllTime = paidClients.reduce((sum, c) => sum + (c.valor_comissao || 0), 0)

    console.log('📊 [useSellerData] Calculated metrics based on created_at:', {
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

        const formattedClient: Cliente = {
          id: String(existingClient.id || ''),
          data_venda: existingClient.data_venda || '',
          nome_cliente: existingClient.nome_cliente || '',
          telefone: existingClient.telefone || '',
          email_cliente: existingClient.email_cliente || '',
          vendedor: existingClient.vendedor || '',
          email_gestor: existingClient.email_gestor || '',
          status_campanha: existingClient.status_campanha || 'Brief',
          data_limite: existingClient.data_limite || '',
          link_grupo: existingClient.link_grupo || '',
          link_briefing: existingClient.link_briefing || '',
          link_criativo: existingClient.link_criativo || '',
          link_site: existingClient.link_site || '',
          numero_bm: existingClient.numero_bm || '',
          comissao_paga: Boolean(existingClient.comissao_paga),
          valor_comissao: Number(existingClient.valor_comissao || 60),
          created_at: existingClient.created_at || '',
          site_status: existingClient.site_status || 'pendente',
          descricao_problema: existingClient.descricao_problema || '',
          saque_solicitado: Boolean(existingClient.saque_solicitado || false),
          comissao: existingClient.comissao || 'Pendente',
          site_pago: Boolean(existingClient.site_pago || false)
        }

        return { exists: true, foundClient: formattedClient }
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

      // For new clients, use the seller's name derived from email for vendedor field
      const emailPrefix = sellerEmail.split('@')[0]
      let vendorName = emailPrefix.replace('vendedor', '')
      
      // Handle specific cases to match existing data
      if (emailPrefix.includes('itamar')) vendorName = 'Itamar'
      if (emailPrefix.includes('edu')) vendorName = 'Edu'
      
      // Insert new client - created_at will be automatically set by the database
      const novoCliente = {
        nome_cliente: String(clienteData.nome_cliente || ''),
        telefone: String(clienteData.telefone || ''),
        email_cliente: String(clienteData.email_cliente || ''),
        data_venda: clienteData.data_venda || new Date().toISOString().split('T')[0],
        vendedor: vendorName,
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
        comissao: 'Pendente',
        site_pago: false
      }

      console.log('📤 [useSellerData] Inserting new client with vendedor:', vendorName)

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
          table: 'todos_clientes'
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
