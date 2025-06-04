
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSacData, type SacSolicitacao } from '@/hooks/useSacData'

export function useGestorSacData() {
  const { user } = useAuth()
  const { getSolicitacoesByGestor, updateGestor, marcarComoConcluido } = useSacData()
  const [solicitacoes, setSolicitacoes] = useState<SacSolicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const gestorEmail = user?.email || ''

  const fetchGestorSolicitacoes = async () => {
    if (!gestorEmail) {
      console.log('📧 [useGestorSacData] Email do gestor não disponível')
      setLoading(false)
      return
    }

    try {
      console.log('🔄 [useGestorSacData] Buscando solicitações para gestor:', gestorEmail)
      setLoading(true)
      setError(null)
      
      const data = await getSolicitacoesByGestor(gestorEmail)
      console.log('✅ [useGestorSacData] Solicitações carregadas:', data.length)
      setSolicitacoes(data)
    } catch (err) {
      console.error('❌ [useGestorSacData] Erro ao carregar solicitações:', err)
      setError('Erro ao carregar solicitações SAC')
      setSolicitacoes([])
    } finally {
      setLoading(false)
    }
  }

  // Função para atualizar uma solicitação específica no estado local
  const updateSolicitacaoLocal = (solicitacaoId: string, updates: Partial<SacSolicitacao>) => {
    setSolicitacoes(prev => prev.map(sol => 
      sol.id === solicitacaoId 
        ? { ...sol, ...updates }
        : sol
    ))
  }

  useEffect(() => {
    fetchGestorSolicitacoes()
  }, [gestorEmail])

  // Calcular métricas específicas do gestor
  const totalSolicitacoes = solicitacoes.length
  
  const solicitacoesHoje = solicitacoes.filter(s => {
    const hoje = new Date().toDateString()
    const dataSolicitacao = new Date(s.created_at).toDateString()
    return hoje === dataSolicitacao
  }).length

  const problemasUrgentes = solicitacoes.filter(s => 
    s.tipo_problema.toLowerCase().includes('urgente') || 
    s.tipo_problema.toLowerCase().includes('crítico')
  ).length

  const solicitacoesAbertas = solicitacoes.filter(s => s.status === 'aberto').length
  const solicitacoesConcluidas = solicitacoes.filter(s => s.status === 'concluido').length

  return {
    solicitacoes,
    loading,
    error,
    gestorEmail,
    totalSolicitacoes,
    solicitacoesHoje,
    problemasUrgentes,
    solicitacoesAbertas,
    solicitacoesConcluidas,
    refetch: fetchGestorSolicitacoes,
    updateGestor,
    updateSolicitacaoLocal,
    marcarComoConcluido
  }
}
