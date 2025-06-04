
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface SugestaoMelhoria {
  id: string
  gestor_email: string
  gestor_nome: string
  titulo: string
  descricao: string
  categoria: 'interface' | 'funcionalidade' | 'performance' | 'bug' | 'outros'
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada' | 'implementada'
  resposta_admin?: string
  respondido_em?: string
  created_at: string
  updated_at: string
}

export function useSugestoesMelhorias(gestorEmail?: string) {
  const [sugestoes, setSugestoes] = useState<SugestaoMelhoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSugestoes = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('sugestoes_melhorias')
        .select('*')
        .order('created_at', { ascending: false })

      // Se gestorEmail fornecido, filtrar apenas suas sugestões
      if (gestorEmail) {
        query = query.eq('gestor_email', gestorEmail)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar sugestões:', error)
        setError(error.message)
        return
      }

      setSugestoes(data || [])
      setError(null)
    } catch (err) {
      console.error('Erro inesperado:', err)
      setError('Erro inesperado ao carregar sugestões')
    } finally {
      setLoading(false)
    }
  }

  const criarSugestao = async (novaSugestao: Omit<SugestaoMelhoria, 'id' | 'created_at' | 'updated_at' | 'status' | 'resposta_admin' | 'respondido_em'>) => {
    try {
      const { data, error } = await supabase
        .from('sugestoes_melhorias')
        .insert([novaSugestao])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar sugestão:', error)
        toast.error('Erro ao enviar sugestão')
        return false
      }

      setSugestoes(prev => [data, ...prev])
      toast.success('Sugestão enviada com sucesso!')
      return true
    } catch (err) {
      console.error('Erro inesperado:', err)
      toast.error('Erro inesperado ao enviar sugestão')
      return false
    }
  }

  const atualizarSugestao = async (id: string, updates: Partial<SugestaoMelhoria>) => {
    try {
      const { data, error } = await supabase
        .from('sugestoes_melhorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar sugestão:', error)
        toast.error('Erro ao atualizar sugestão')
        return false
      }

      setSugestoes(prev => prev.map(s => s.id === id ? data : s))
      toast.success('Sugestão atualizada com sucesso!')
      return true
    } catch (err) {
      console.error('Erro inesperado:', err)
      toast.error('Erro inesperado ao atualizar sugestão')
      return false
    }
  }

  const responderSugestao = async (id: string, respostaAdmin: string, novoStatus: SugestaoMelhoria['status']) => {
    try {
      const updates = {
        resposta_admin: respostaAdmin,
        status: novoStatus,
        respondido_em: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sugestoes_melhorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao responder sugestão:', error)
        toast.error('Erro ao responder sugestão')
        return false
      }

      setSugestoes(prev => prev.map(s => s.id === id ? data : s))
      toast.success('Resposta enviada com sucesso!')
      return true
    } catch (err) {
      console.error('Erro inesperado:', err)
      toast.error('Erro inesperado ao responder sugestão')
      return false
    }
  }

  useEffect(() => {
    fetchSugestoes()

    // Configurar realtime para atualizações em tempo real
    const channel = supabase
      .channel('sugestoes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sugestoes_melhorias'
      }, () => {
        fetchSugestoes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gestorEmail])

  return {
    sugestoes,
    loading,
    error,
    criarSugestao,
    atualizarSugestao,
    responderSugestao,
    refetch: fetchSugestoes
  }
}
