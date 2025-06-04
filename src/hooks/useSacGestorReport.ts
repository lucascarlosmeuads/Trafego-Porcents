
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface SacGestorStats {
  nome_gestor: string
  email_gestor: string
  total_sacs: number
  sacs_abertos: number
  sacs_em_andamento: number
  sacs_concluidos: number
  tempo_medio_resolucao_horas: number | null
  taxa_conclusao: number
}

export function useSacGestorReport() {
  const [stats, setStats] = useState<SacGestorStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      console.log('🔄 [useSacGestorReport] Buscando estatísticas dos gestores...')
      setLoading(true)
      
      // Query para buscar estatísticas por gestor
      const { data, error } = await supabase
        .from('sac_clientes')
        .select('nome_gestor, email_gestor, status, created_at, concluido_em')
        .not('email_gestor', 'is', null)
        .not('nome_gestor', 'is', null)

      if (error) {
        console.error('❌ [useSacGestorReport] Erro na query:', error)
        throw error
      }

      // Processar dados para criar estatísticas
      const gestorMap = new Map<string, SacGestorStats>()

      data?.forEach(sac => {
        const key = sac.email_gestor
        if (!gestorMap.has(key)) {
          gestorMap.set(key, {
            nome_gestor: sac.nome_gestor,
            email_gestor: sac.email_gestor,
            total_sacs: 0,
            sacs_abertos: 0,
            sacs_em_andamento: 0,
            sacs_concluidos: 0,
            tempo_medio_resolucao_horas: null,
            taxa_conclusao: 0
          })
        }

        const stats = gestorMap.get(key)!
        stats.total_sacs++

        switch (sac.status) {
          case 'aberto':
            stats.sacs_abertos++
            break
          case 'em_andamento':
            stats.sacs_em_andamento++
            break
          case 'concluido':
            stats.sacs_concluidos++
            break
        }
      })

      // Calcular tempos de resolução e taxas
      const statsArray = Array.from(gestorMap.values()).map(stat => {
        stat.taxa_conclusao = stat.total_sacs > 0 
          ? Math.round((stat.sacs_concluidos / stat.total_sacs) * 100) 
          : 0

        // Calcular tempo médio de resolução para SACs concluídos
        const sacsDoGestor = data?.filter(s => 
          s.email_gestor === stat.email_gestor && 
          s.status === 'concluido' && 
          s.concluido_em
        ) || []

        if (sacsDoGestor.length > 0) {
          const tempos = sacsDoGestor.map(sac => {
            const inicio = new Date(sac.created_at)
            const fim = new Date(sac.concluido_em!)
            return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60) // horas
          })
          
          stat.tempo_medio_resolucao_horas = Math.round(
            tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length * 10
          ) / 10 // Uma casa decimal
        }

        return stat
      })

      // Ordenar por total de SACs (maior problema primeiro)
      statsArray.sort((a, b) => b.total_sacs - a.total_sacs)

      console.log('✅ [useSacGestorReport] Estatísticas processadas:', statsArray.length, 'gestores')
      setStats(statsArray)
      setError(null)

    } catch (err) {
      console.error('💥 [useSacGestorReport] Erro ao buscar estatísticas:', err)
      setError('Erro ao carregar relatório de gestores')
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}
