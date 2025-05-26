
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BriefingData {
  id: string
  email_cliente: string
  nome_produto: string
  descricao_resumida: string | null
  publico_alvo: string | null
  diferencial: string | null
  investimento_diario: number | null
  observacoes_finais: string | null
  created_at: string
  updated_at: string
}

export function useBriefingData() {
  const [briefings, setBriefings] = useState<BriefingData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAllBriefings = async () => {
    try {
      console.log('🔍 [useBriefingData] Buscando TODOS os briefings...')
      
      const { data, error } = await supabase
        .from('briefings_cliente')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [useBriefingData] Erro ao buscar briefings:', error)
        return
      }

      console.log('✅ [useBriefingData] Total de briefings encontrados:', data?.length || 0)
      console.log('📊 [useBriefingData] Emails dos briefings:', data?.map(b => b.email_cliente) || [])
      
      setBriefings(data || [])
    } catch (error) {
      console.error('💥 [useBriefingData] Erro crítico:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBriefingByEmail = (emailCliente: string): BriefingData | null => {
    if (!emailCliente) return null
    
    const emailToSearch = emailCliente.trim().toLowerCase()
    
    // Busca exata
    let briefing = briefings.find(b => 
      b.email_cliente?.trim().toLowerCase() === emailToSearch
    )
    
    // Busca sem espaços
    if (!briefing) {
      briefing = briefings.find(b => 
        b.email_cliente?.replace(/\s+/g, '').toLowerCase() === emailToSearch.replace(/\s+/g, '')
      )
    }
    
    // Busca parcial
    if (!briefing) {
      briefing = briefings.find(b => 
        b.email_cliente?.toLowerCase().includes(emailToSearch) ||
        emailToSearch.includes(b.email_cliente?.toLowerCase())
      )
    }
    
    console.log('🔍 [useBriefingData] Busca briefing para:', emailCliente, briefing ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO')
    
    return briefing || null
  }

  const hasBriefing = (emailCliente: string): boolean => {
    return getBriefingByEmail(emailCliente) !== null
  }

  useEffect(() => {
    fetchAllBriefings()
    
    // Configurar realtime para atualizar automaticamente
    const channel = supabase
      .channel('briefings_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'briefings_cliente' },
        () => {
          console.log('🔄 [useBriefingData] Mudança detectada, atualizando briefings...')
          fetchAllBriefings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    briefings,
    loading,
    getBriefingByEmail,
    hasBriefing,
    refetch: fetchAllBriefings
  }
}
