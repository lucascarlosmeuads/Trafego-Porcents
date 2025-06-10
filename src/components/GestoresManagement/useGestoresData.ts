
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { type Gestor } from '@/types/gestor'

export function useGestoresData() {
  const [gestores, setGestores] = useState<Gestor[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const ensureCarolExists = async (gestoresData: Gestor[]) => {
    const hasCarol = gestoresData.some(g => g.nome && g.nome.toLowerCase().includes('carol'))
    
    if (!hasCarol) {
      console.log('⚠️ [GESTORES] Carol não encontrada, cadastrando automaticamente...')
      try {
        const { data: carolData, error: carolError } = await supabase
          .from('gestores')
          .insert([{
            nome: 'Carol',
            email: 'carol@trafegoporcents.com',
            pode_adicionar_cliente: true,
            ativo: true
          }])
          .select()
          .single()

        if (!carolError && carolData) {
          console.log('✅ [GESTORES] Carol cadastrada automaticamente:', carolData.id)
          gestoresData.push(carolData)
          return true
        }
      } catch (carolCadastroError) {
        console.error('❌ [GESTORES] Erro ao cadastrar Carol automaticamente:', carolCadastroError)
      }
    }
    return false
  }

  const ensureAndrezaExists = (gestoresData: Gestor[]) => {
    const hasAndreza = gestoresData.some(g => g.nome && g.nome.toLowerCase().includes('andreza'))
    
    if (!hasAndreza) {
      console.log('⚠️ [GESTORES] Andreza não encontrada, adicionando registro fallback')
      gestoresData.push({
        id: 'andreza-fallback',
        nome: 'Andreza',
        email: 'andreza@trafegoporcents.com',
        ativo: true,
        pode_adicionar_cliente: true,
        created_at: '2025-05-24T00:00:00+00:00',
        updated_at: '2025-05-24T00:00:00+00:00',
        user_id: null
      })
    }
  }

  const fetchGestores = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    }
    
    try {
      console.log('🔍 [GESTORES] Buscando TODOS os gestores da tabela gestores...')
      const { data, error } = await supabase
        .from('gestores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [GESTORES] Erro ao buscar gestores:', error)
        throw error
      }

      const gestoresData = data ?? []
      console.log('✅ [GESTORES] Gestores carregados:', gestoresData.length, 'registros')
      console.log('📊 [GESTORES] Dados dos gestores:', gestoresData)
      console.log('👥 [GESTORES] Nomes encontrados:', gestoresData.map(g => g.nome))
      
      // Garantir que Carol existe
      const carolAdded = await ensureCarolExists(gestoresData)
      
      // Garantir que Andreza existe (fallback)
      ensureAndrezaExists(gestoresData)
      
      console.log('📋 [GESTORES] Lista final de gestores:', gestoresData.length, 'registros')
      setGestores(gestoresData)
      
      if (showRefreshing) {
        toast({
          title: "Sucesso",
          description: `Lista atualizada - ${gestoresData.length} gestores encontrados${carolAdded ? ' (Carol cadastrada automaticamente)' : ''}`
        })
      }
    } catch (error: any) {
      console.error('💥 [GESTORES] Erro ao carregar gestores:', error)
      
      toast({
        title: "Erro",
        description: `Erro ao carregar gestores: ${error.message}`,
        variant: "destructive"
      })
      
      // Fallback em caso de erro
      const fallbackGestores = [
        {
          id: 'andreza-fallback',
          nome: 'Andreza',
          email: 'andreza@trafegoporcents.com',
          ativo: true,
          pode_adicionar_cliente: true,
          created_at: '2025-05-24T00:00:00+00:00',
          updated_at: '2025-05-24T00:00:00+00:00',
          user_id: null
        },
        {
          id: 'carol-fallback',
          nome: 'Carol',
          email: 'carol@trafegoporcents.com',
          ativo: true,
          pode_adicionar_cliente: true,
          created_at: '2025-06-10T00:00:00+00:00',
          updated_at: '2025-06-10T00:00:00+00:00',
          user_id: null
        }
      ]
      console.log('🔄 [GESTORES] Usando fallback:', fallbackGestores.length, 'gestores')
      setGestores(fallbackGestores)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGestores()
    
    // Subscribe to real-time changes in gestores table
    const channel = supabase
      .channel('gestores-management-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gestores'
        },
        (payload) => {
          console.log('🔄 Real-time change detected in gestores table:', payload)
          fetchGestores()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleRefresh = () => {
    fetchGestores(true)
  }

  return {
    gestores,
    loading,
    refreshing,
    fetchGestores,
    handleRefresh
  }
}
